"use client";

const mockBuys = [
  { price: 0.62, size: 800 },
  { price: 0.61, size: 620 },
  { price: 0.59, size: 495 },
];

const mockSells = [
  { price: 0.66, size: 540 },
  { price: 0.69, size: 430 },
  { price: 0.71, size: 310 },
];

export default function OrderBookPanel() {
  return (
    <div className="border border-white/10 bg-charcoal/60 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-mist">Order Book</p>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-electric">Bids</p>
          <div className="mt-2 flex flex-col gap-3">
            {mockBuys.map((order) => (
              <div key={`buy-${order.price}`} className="flex items-center justify-between">
                <span className="text-white">{(order.price * 100).toFixed(0)}%</span>
                <span className="text-mist">{order.size} YES</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Asks</p>
          <div className="mt-2 flex flex-col gap-3">
            {mockSells.map((order) => (
              <div key={`sell-${order.price}`} className="flex items-center justify-between">
                <span className="text-white">{(order.price * 100).toFixed(0)}%</span>
                <span className="text-mist">{order.size} NO</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

