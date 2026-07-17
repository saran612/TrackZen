import React from 'react';
import { Search, Filter, AlertTriangle, Box, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import './InventoryView.css';

const skuData = [
  {
    id: 'BEV-8492-DR',
    product: 'Organic Dark Roast 12oz',
    zone: 'Aisle 4, Shelf 2',
    attention: 98,
    attentionTrend: 'up',
    attentionLabel: 'Very High',
    velocity: 1.2,
    velocityTrend: 'Low',
    stock: 142,
    stockTrend: 'flat',
    action: 'Investigate',
    actionType: 'outline'
  },
  {
    id: 'HW-32-BLK',
    product: 'HydroFlask 32oz Black',
    zone: 'Endcap B',
    attention: 74,
    attentionTrend: 'none',
    attentionLabel: 'High',
    velocity: 8.5,
    velocityTrend: 'High',
    stock: 12,
    stockTrend: 'down',
    action: 'Restock',
    actionType: 'primary'
  },
  {
    id: 'EL-USB-2M',
    product: 'USB-C Cable 2m Basic',
    zone: 'Aisle 8, Bin 3',
    attention: 22,
    attentionTrend: 'none',
    attentionLabel: 'Low',
    velocity: 4.1,
    velocityTrend: 'Steady',
    stock: 88,
    stockTrend: 'flat',
    action: 'OK',
    actionType: 'outline'
  }
];

export default function InventoryView() {
  return (
    <div className="inventory-view flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="w-2/3">
          <h2 className="text-3xl font-bold text-primary mb-1">Inventory Intelligence</h2>
          <p className="text-secondary">Correlating camera-derived shelf attention with point-of-sale velocity to identify placement issues and potential stock-outs before they happen.</p>
        </div>
        <div className="flex gap-4">
          <div className="search-bar flex items-center bg-white border border-gray-200 rounded-md px-3 py-2">
            <Search size={16} className="text-secondary mr-2" />
            <input type="text" placeholder="Search products, SKUs..." className="bg-transparent border-none outline-none text-sm w-48" />
          </div>
          <button className="btn btn-outline flex items-center gap-2 bg-white">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="card border-l-4 border-l-danger">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-danger">
              <AlertTriangle size={16} /> High Attention, Low Sales
            </div>
            <span className="badge badge-danger">Action Req</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-4xl font-bold">12</h2>
            <span className="text-secondary font-medium">SKUs</span>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-secondary">Items heavily browsed but rarely purchased today. Review placement or pricing.</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Box size={16} /> Critical Stock Levels
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-4xl font-bold">8</h2>
            <span className="text-secondary font-medium">SKUs</span>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-secondary">High velocity items projected to stock out within 24 hours based on current footfall.</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Eye size={16} /> Avg Shelf Attention
            </div>
            <span className="badge badge-primary">+14% vs avg</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-4xl font-bold">42s</h2>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-secondary">Average time shoppers spend looking at endcap displays in Zone A.</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title !mb-0">Priority SKU Analysis</h3>
          <div className="flex gap-2">
            <button className="icon-btn"><ArrowDown size={16} /></button>
            <button className="icon-btn"><Box size={16} /></button>
          </div>
        </div>
        <table className="w-full text-left inventory-table">
          <thead>
            <tr className="text-secondary text-sm border-b">
              <th className="pb-4 font-medium">Product / SKU</th>
              <th className="pb-4 font-medium">Zone</th>
              <th className="pb-4 font-medium text-center">Attention Score</th>
              <th className="pb-4 font-medium text-center">Velocity</th>
              <th className="pb-4 font-medium text-center">Stock Trend</th>
              <th className="pb-4 font-medium text-right">Current Stock</th>
              <th className="pb-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {skuData.map(sku => (
              <tr key={sku.id} className="border-b">
                <td className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="product-thumb"></div>
                    <div>
                      <div className="font-bold">{sku.product}</div>
                      <div className="text-xs text-secondary mt-1">SKU: {sku.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-secondary">{sku.zone}</td>
                <td className="py-4 text-center">
                  <div className={`font-bold ${sku.attention > 80 ? 'text-danger' : ''}`}>
                    {sku.attention} {sku.attentionTrend === 'up' && <ArrowUp size={12} className="inline" />}
                  </div>
                  <div className="text-xs text-secondary">{sku.attentionLabel}</div>
                </td>
                <td className="py-4 text-center">
                  <div className="font-bold">{sku.velocity}/hr</div>
                  <div className="text-xs text-secondary">{sku.velocityTrend}</div>
                </td>
                <td className="py-4 text-center">
                  {/* Miniature sparkline simulation */}
                  <div className={`trend-line ${sku.stockTrend}`}></div>
                </td>
                <td className="py-4 text-right">
                  <div className={`font-bold ${sku.stock < 20 ? 'text-danger' : ''}`}>
                    {sku.stock} {sku.stock < 20 && <ArrowDown size={12} className="inline" />}
                  </div>
                </td>
                <td className="py-4 text-right">
                  <button className={`btn ${sku.actionType === 'primary' ? 'btn-primary' : 'btn-outline'}`}>
                    {sku.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
