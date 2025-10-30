require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inkly', { useNewUrlParser: true, useUnifiedTopology: true });

const OrderSchema = new mongoose.Schema({
  items: Array,
  total: Number,
  status: { type: String, default: 'created' },
  razorpayOrderId: String,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || '', key_secret: process.env.RAZORPAY_KEY_SECRET || '' });

app.post('/api/orders', async (req, res) => {
  const { items, total } = req.body;
  const order = new Order({ items, total });
  await order.save();
  const options = { amount: (total||0) * 100, currency: 'INR', receipt: `inkly_rcpt_${order._id}` };
  try {
    const rOrder = await razorpay.orders.create(options);
    order.razorpayOrderId = rOrder.id;
    await order.save();
    res.json({ orderId: order._id, razorpayOrderId: rOrder.id, amount: options.amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'razorpay_create_failed' });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;
  const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
  if (generated_signature === razorpay_signature) {
    await Order.findByIdAndUpdate(orderId, { status: 'paid' });
    res.json({ ok: true });
  } else {
    res.status(400).json({ ok: false, error: 'invalid_signature' });
  }
});

app.post('/api/vendors/webhook/order_status', async (req, res) => {
  const { orderId, status } = req.body;
  await Order.findByIdAndUpdate(orderId, { status });
  res.json({ ok: true });
});

app.listen(process.env.PORT || 4000, () => console.log('Inkly backend running'));