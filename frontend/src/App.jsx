import React, { useState, useRef, useEffect } from "react";
import './index.css';

export default function App() {
  const [products] = useState([
    { id: 1, name: "Classic Tee", price: 499, type: "tshirt" },
    { id: 2, name: "Hoodie", price: 899, type: "hoodie" },
    { id: 3, name: "Mug", price: 299, type: "mug" },
  ]);
  const [selected, setSelected] = useState(products[0]);
  const [cart, setCart] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    // placeholder: fetch products from API in production
  }, []);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
  }

  function addToCart() {
    setCart((c) => [...c, { ...selected, image: uploadedImage }]);
    setUploadedImage(null);
    if (fileRef.current) fileRef.current.value = null;
  }

  async function createOrder() {
    const payload = { items: cart.map(i => ({ productId: i.id, price: i.price })), total: cart.reduce((s,i)=>s+i.price,0) };
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data?.razorpayOrderId) {
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'Inkly',
          description: 'Order #' + data.orderId,
          order_id: data.razorpayOrderId,
          handler: async function (response){
            await fetch('/api/payments/verify', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature, orderId: data.orderId}) });
            alert('Payment successful!');
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Order created (no payment) — backend stub: ' + data.orderId);
      }
    } catch (e) {
      alert('Order creation failed: ' + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inkly — India POD</h1>
        <div className="space-x-2">
          <button className="px-3 py-1 bg-white rounded shadow">Sign in</button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded">Get Started</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1 bg-white p-4 rounded shadow-sm">
          <h2 className="font-semibold mb-3">Products</h2>
          <ul className="space-y-3">
            {products.map(p => (
              <li key={p.id} className={`p-3 rounded cursor-pointer flex items-center justify-between ${selected.id===p.id? 'ring-2 ring-indigo-200':''}`} onClick={()=>setSelected(p)}>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">₹{p.price}</div>
                </div>
                <div className="text-xs text-gray-400">{p.type}</div>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Upload design</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="w-full" />
            <button onClick={addToCart} className="mt-3 w-full bg-indigo-600 text-white py-2 rounded">Add to cart</button>
          </div>
        </section>

        <section className="md:col-span-1 bg-white p-4 rounded shadow-sm">
          <h2 className="font-semibold mb-3">Mockup</h2>
          <div className="w-full flex items-center justify-center">
            <div className="relative bg-gray-100 rounded-lg p-6 w-64 h-80 flex items-center justify-center">
              <div className="w-44 h-56 bg-white rounded-xl shadow-inner flex items-center justify-center">
                {uploadedImage ? <img src={uploadedImage} alt="design" style={{ maxWidth:'70%', maxHeight:'60%' }} /> : <div className="text-xs text-gray-400">Upload artwork</div>}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">Selected: <strong>{selected.name}</strong> • ₹{selected.price}</div>
        </section>

        <aside className="md:col-span-1 bg-white p-4 rounded shadow-sm">
          <h2 className="font-semibold mb-3">Cart</h2>
          <div className="space-y-3">
            {cart.length===0? <div className="text-sm text-gray-400">Cart empty</div> : cart.map((it,idx)=> (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">₹{it.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  {it.image && <img src={it.image} alt="thumb" className="w-10 h-10 rounded object-cover" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3">
            <div className="flex items-center justify-between text-sm"><div>Subtotal</div><div>₹{cart.reduce((s,i)=>s+i.price,0)}</div></div>
            <button onClick={createOrder} disabled={cart.length===0} className="mt-3 w-full bg-green-600 text-white py-2 rounded">Checkout</button>
          </div>
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto mt-8 text-center text-xs text-gray-500">Prototype. For production, split code, add auth, and connect backend.</footer>
    </div>
  );
}
