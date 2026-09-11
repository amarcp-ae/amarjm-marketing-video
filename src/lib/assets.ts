/**
 * Relative paths under the Remotion publicDir (`assets/`).
 * Pass these to `staticFile(...)`.
 */
export const ASSETS = {
  screens: {
    S02: {
      metalRate: 'screens/S02/metal-rate.png',
    },
    S03: {
      paymentEntry: 'screens/S03/payment-entry-new.png',
      salesInvoice: 'screens/S03/sales-invoice-new.png',
    },
    S04: {
      jewelleryGrossProfit: 'screens/S04/jewellery-gross-profit.png',
    },
    S05: {
      itemMetal: 'screens/S05/item-metal.png',
      stockBalance: 'screens/S05/stock-balance.png',
    },
    S06: {
      homeDesktop: 'screens/S06/home-desktop.png',
      homeIphone: 'screens/S06/home-iphone.png',
      productDesktop: 'screens/S06/product-desktop.png',
      walletDesktop: 'screens/S06/wallet-desktop.png',
    },
    S07: {
      posPaymentDialog: 'screens/S07/pos-payment-dialog.png',
      posScan: 'screens/S07/pos-scan.png',
    },
    S08: {
      posClosingEntry: 'screens/S08/pos-closing-entry.png',
      posOpeningEntry: 'screens/S08/pos-opening-entry.png',
      posShiftClose: 'screens/S08/pos-shift-close.png',
    },
    S09: {
      customerKyc: 'screens/S09/customer-kyc.png',
      planetRegister: 'screens/S09/planet-register.png',
      planetSuccess: 'screens/S09/planet-success.png',
      taxFreeTransaction: 'screens/S09/tax-free-transaction.png',
      taxInvoice: 'screens/S09/tax-invoice.png',
      vatReport: 'screens/S09/vat-report.png',
    },
    S10: {
      reportDialog: 'screens/S10/report-dialog.png',
      supportDialog: 'screens/S10/support-dialog.png',
    },
    S12: {
      home: 'screens/S12/home.png',
      reportDialog: 'screens/S12/report-dialog.png',
      purchaseInvoice: 'screens/S12/purchase-invoice.png',
    },
  },
  video: {
    S02MetalRate: 'video/S02-metal-rate.webm',
    S07PosScan: 'video/S07-pos-scan.webm',
  },
  items: {
    diamondHaloPendant: 'items/diamond-halo-pendant.png',
    diamondSolitaireRing: 'items/diamond-solitaire-ring.png',
    diamondStudEarrings: 'items/diamond-stud-earrings.png',
    diamondTennisBracelet: 'items/diamond-tennis-bracelet.png',
    goldBangle22k: 'items/gold-bangle-22k.png',
    goldCoinPendant22k: 'items/gold-coin-pendant-22k.png',
    goldCurbBracelet21k: 'items/gold-curb-bracelet-21k.png',
    goldDropEarrings18k: 'items/gold-drop-earrings-18k.png',
    goldPendantNecklace21k: 'items/gold-pendant-necklace-21k.png',
    goldRubyRing18k: 'items/gold-ruby-ring-18k.png',
    goldWeddingBandSet21k: 'items/gold-wedding-band-set-21k.png',
    roseGoldChain18k: 'items/rose-gold-chain-18k.png',
  },
} as const;

export type AssetPath = string;
