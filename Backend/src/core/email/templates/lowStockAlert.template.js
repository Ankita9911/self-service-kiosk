/**
 * Low Stock Alert Email Template
 * Generates HTML email for low stock notifications
 */

export function getLowStockAlertTemplate({
  ingredientName,
  currentStock,
  minThreshold,
  unit,
  outletName,
  franchiseName,
}) {
  const stockDifference = minThreshold - currentStock;
  const appName = "HyperHub Kitchen";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Low Stock Alert — ${appName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px 40px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 36px 32px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; }
    .body { padding: 32px; }
    .alert-box { background: #fef2f2; border: 2px solid #fee2e2; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .alert-title { font-size: 13px; color: #991b1b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .item-name { font-size: 18px; color: #7f1d1d; font-weight: 700; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
    .detail-item { background: #f8f9fa; border-radius: 10px; padding: 14px 16px; }
    .detail-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .detail-value { font-size: 16px; color: #1f2937; font-weight: 700; }
    .detail-subtext { font-size: 11px; color: #9ca3af; margin-top: 4px; }
    .outlet-info { background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 6px; padding: 12px 14px; margin-top: 20px; }
    .outlet-info p { font-size: 12px; color: #1b7a3f; line-height: 1.6; margin: 4px 0; }
    .outlet-info strong { color: #15803d; }
    .action-box { background: #eeefff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 16px; margin: 20px 0; }
    .action-text { font-size: 13px; color: #3730a3; line-height: 1.6; }
    .action-text strong { color: #4f46e5; }
    .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
    .footer { padding: 16px 32px 28px; text-align: center; }
    .footer p { font-size: 11px; color: #9ca3af; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>⚠️ Low Stock Alert</h1>
        <p>Immediate attention required for inventory management</p>
      </div>
      <div class="body">
        <div class="alert-box">
          <div class="alert-title">🔴 Critical Stock Level</div>
          <div class="item-name">${ingredientName}</div>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Current Stock</div>
            <div class="detail-value">${currentStock} ${unit}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Minimum Threshold</div>
            <div class="detail-value">${minThreshold} ${unit}</div>
          </div>
        </div>

        <div class="detail-item" style="margin-top: 16px;">
          <div class="detail-label">Stock Deficit</div>
          <div class="detail-value" style="color: #dc2626;">${stockDifference} ${unit} below threshold</div>
          <div class="detail-subtext">This ingredient needs immediate replenishment</div>
        </div>

        <div class="outlet-info">
          <p><strong>📍 Outlet:</strong> ${outletName}</p>
          <p><strong>🏢 Franchise:</strong> ${franchiseName}</p>
        </div>

        <div class="action-box">
          <div class="action-text">
            <strong>Recommended Action:</strong> Review current stock levels and consider placing a purchase order immediately to prevent stockouts and service disruption.
          </div>
        </div>

        <div class="divider"></div>
        <p style="font-size:12px;color:#6b7280; line-height: 1.6;">
          This is an automated alert from ${appName}. Low stock alerts help maintain optimal inventory levels and prevent operational disruptions. If you believe this is an error, please contact your administrator.
        </p>
      </div>
      <div class="footer">
        <p>${appName} · Automated Inventory Alert · Do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
