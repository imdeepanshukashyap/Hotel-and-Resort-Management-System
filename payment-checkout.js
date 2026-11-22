// ============================================================================
// payment-checkout.js — Hotel & Resort Management (Booking & Payment Module)
// Covers: JS Types, Operators, Math, Control Structures, Scope, Strings,
// Arrays, Comparisons, Strict Mode, Switch, Loops, Type Conversion, Errors,
// Forms, RegExp, Functions, Prototypes, Classes, OOPS, DOM, Events,
// Promises, Async/Await, and jQuery & AJAX
// ============================================================================

"use strict";

// ----------------------------------------------------------------------------
// 1. Constants, Tariffs, Promo Codes & Add-ons (Types, Scope, Strings, Arrays)
// ----------------------------------------------------------------------------
const ROOM_TARIFFS = {
  deluxe: 3500,
  suite: 6000,
  resortVilla: 9500
};

const GST_RATE = 0.18;
const MIN_BOOKING_AMOUNT = 1000;

const PROMO_DISCOUNTS = {
  STAY10: 0.10,
  RESORT15: 0.15,
  WEEKEND5: 0.05
};

const AVAILABLE_ADDONS = [
  { id: "breakfast", label: "Complimentary Breakfast Buffet", price: 650 },
  { id: "airportPickup", label: "Airport / Station Transfer", price: 1200 },
  { id: "spaPass", label: "Resort Spa & Pool Pass", price: 1800 }
];

const BOOKING_PATTERNS = {
  fullName: /^[a-zA-Z\s.'-]{2,60}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[6-9]\d{9}$/,
  upiId: /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/,
  cardNumber: /^(?:\d{4}[-\s]?){3}\d{4}$/,
  expiry: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
  cvv: /^\d{3,4}$/
};

// ----------------------------------------------------------------------------
// 2. Fare Math, Control Structures, String Normalization & Comparisons
// ----------------------------------------------------------------------------
function normalizeCode(rawCode) {
  if (typeof rawCode !== "string") {
    return "";
  }
  return rawCode.trim().toUpperCase();
}

function calculateStayNights(checkInDateStr, checkOutDateStr) {
  const checkIn = new Date(checkInDateStr);
  const checkOut = new Date(checkOutDateStr);
  const diffMs = checkOut - checkIn;

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return 1;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil(diffMs / msPerDay));
}

function calculateBaseFare(roomType = "deluxe", roomsCount = 1, nights = 1) {
  let baseRate = ROOM_TARIFFS.deluxe;

  if (roomType === "suite") {
    baseRate = ROOM_TARIFFS.suite;
  } else if (roomType === "resortVilla") {
    baseRate = ROOM_TARIFFS.resortVilla;
  }

  const safeRooms = Math.max(1, Math.floor(Number(roomsCount) || 1));
  const safeNights = Math.max(1, Math.floor(Number(nights) || 1));
  const subtotal = baseRate * safeRooms * safeNights;

  let stayDiscountRate = 0;
  if (safeNights >= 7) {
    stayDiscountRate = 0.15;
  } else if (safeNights >= 3) {
    stayDiscountRate = 0.08;
  }

  const discountAmount = Math.round(subtotal * stayDiscountRate);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round(afterDiscount * GST_RATE);
  const grandTotal = afterDiscount + gstAmount;
  const meetsMinimum = grandTotal >= MIN_BOOKING_AMOUNT;

  return {
    roomType,
    baseRate,
    roomsCount: safeRooms,
    nights: safeNights,
    subtotal,
    discountAmount,
    gstAmount,
    grandTotal,
    meetsMinimum
  };
}

function evaluatePromoCode(rawCode, currentAmount) {
  const cleanCode = normalizeCode(rawCode);
  const hasCode = cleanCode.length > 0;
  const isValidPromo =
    hasCode && Object.prototype.hasOwnProperty.call(PROMO_DISCOUNTS, cleanCode);
  const isEligibleAmount = Number(currentAmount) >= MIN_BOOKING_AMOUNT;
  const isPromoApplied = isValidPromo && isEligibleAmount;

  let promoDiscount = 0;
  if (isPromoApplied) {
    const rate = PROMO_DISCOUNTS[cleanCode];
    promoDiscount = Math.round(Number(currentAmount) * rate);
  }

  return {
    code: cleanCode,
    hasCode,
    isValidPromo,
    isPromoApplied,
    promoDiscount,
    finalAmount: Math.max(0, Number(currentAmount) - promoDiscount)
  };
}

// ----------------------------------------------------------------------------
// 3. Switch Routing, Loops, Type Conversion & Error Handling
// ----------------------------------------------------------------------------
function getPaymentMethodDetails(methodCode) {
  const normalizedMethod = String(methodCode || "").trim().toLowerCase();

  switch (normalizedMethod) {
    case "card":
      return {
        code: "card",
        label: "Credit / Debit Card",
        gatewayFeeRate: 0.015,
        instantSettlement: true
      };
    case "upi":
      return {
        code: "upi",
        label: "UPI (GPay / PhonePe / Paytm)",
        gatewayFeeRate: 0,
        instantSettlement: true
      };
    case "netbanking":
      return {
        code: "netbanking",
        label: "Net Banking",
        gatewayFeeRate: 0.01,
        instantSettlement: true
      };
    case "pay_at_hotel":
      return {
        code: "pay_at_hotel",
        label: "Pay at Resort Desk",
        gatewayFeeRate: 0,
        instantSettlement: false
      };
    default:
      return {
        code: "upi",
        label: "UPI (Default)",
        gatewayFeeRate: 0,
        instantSettlement: true
      };
  }
}

function calculateAddonsTotal(selectedAddonIds) {
  try {
    if (!Array.isArray(selectedAddonIds)) {
      throw new TypeError("Selected add-ons must be an array.");
    }

    let addonsSum = 0;
    for (let i = 0; i < AVAILABLE_ADDONS.length; i++) {
      const addon = AVAILABLE_ADDONS[i];
      for (let j = 0; j < selectedAddonIds.length; j++) {
        if (String(selectedAddonIds[j]) === addon.id) {
          addonsSum += Number(addon.price) || 0;
        }
      }
    }

    return addonsSum;
  } catch (error) {
    console.error("[PaymentCheckout Addons Error]:", error.message);
    return 0;
  }
}

// ----------------------------------------------------------------------------
// 4. Form & RegExp Validation
// ----------------------------------------------------------------------------
function validateGuestAndPaymentForm(formData) {
  const errors = {};
  const guestName = String(formData.guestName || "").trim();
  const email = String(formData.email || "").trim();
  const phone = String(formData.phone || "").trim();
  const paymentMethod = String(formData.paymentMethod || "upi").trim();

  if (!BOOKING_PATTERNS.fullName.test(guestName)) {
    errors.guestName = "Enter a valid guest name.";
  }

  if (!BOOKING_PATTERNS.email.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!BOOKING_PATTERNS.phone.test(phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  if (paymentMethod === "upi") {
    const upiId = String(formData.upiId || "").trim();
    if (!BOOKING_PATTERNS.upiId.test(upiId)) {
      errors.upiId = "Enter a valid UPI ID (e.g., guest@okaxis).";
    }
  } else if (paymentMethod === "card") {
    const cardNumber = String(formData.cardNumber || "").trim();
    const expiry = String(formData.expiry || "").trim();
    const cvv = String(formData.cvv || "").trim();

    if (!BOOKING_PATTERNS.cardNumber.test(cardNumber)) {
      errors.cardNumber = "Enter a valid 16-digit card number.";
    }
    if (!BOOKING_PATTERNS.expiry.test(expiry)) {
      errors.expiry = "Enter expiry in MM/YY format.";
    }
    if (!BOOKING_PATTERNS.cvv.test(cvv)) {
      errors.cvv = "Enter a 3 or 4 digit CVV.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ----------------------------------------------------------------------------
// 5. Constructor Function, Prototypes & Higher-Order Functions
// ----------------------------------------------------------------------------
function FareEstimator(baseFare, addonsTotal, promoDiscount, gatewayFeeRate) {
  this.baseFare = Number(baseFare) || 0;
  this.addonsTotal = Number(addonsTotal) || 0;
  this.promoDiscount = Number(promoDiscount) || 0;
  this.gatewayFeeRate = Number(gatewayFeeRate) || 0;
}

FareEstimator.prototype.getGrossAmount = function () {
  return this.baseFare + this.addonsTotal;
};

FareEstimator.prototype.getNetPayable = function () {
  const discounted = Math.max(0, this.getGrossAmount() - this.promoDiscount);
  const gatewayFee = Math.round(discounted * this.gatewayFeeRate);
  return {
    grossAmount: this.getGrossAmount(),
    promoDiscount: this.promoDiscount,
    gatewayFee,
    finalPayable: discounted + gatewayFee
  };
};

function summarizeLineItems(lineItems) {
  return lineItems
    .filter((item) => item && Number(item.amount) > 0)
    .map((item) => ({
      title: String(item.title),
      amount: Number(item.amount),
      formatted: `₹${Number(item.amount).toLocaleString("en-IN")}`
    }))
    .reduce((acc, row) => {
      acc.rows.push(row);
      acc.total += row.amount;
      return acc;
    }, { rows: [], total: 0 });
}

// ----------------------------------------------------------------------------
// 6. ES6 Classes, OOPS & Advanced Array Methods
// ----------------------------------------------------------------------------
class BookingRecord {
  constructor({
    guestName,
    email,
    phone,
    roomType,
    roomsCount,
    nights,
    selectedAddonIds,
    promoCode
  }) {
    this.bookingId = `RES-${Date.now().toString().slice(-6)}`;
    this.guestName = String(guestName || "").trim();
    this.email = String(email || "").trim();
    this.phone = String(phone || "").trim();
    this.roomType = roomType || "deluxe";
    this.roomsCount = Math.max(1, parseInt(roomsCount, 10) || 1);
    this.nights = Math.max(1, parseInt(nights, 10) || 1);
    this.selectedAddonIds = Array.isArray(selectedAddonIds) ? selectedAddonIds : [];
    this.promoCode = normalizeCode(promoCode);
    this.status = "PENDING_PAYMENT";
  }

  getMatchedAddons() {
    return AVAILABLE_ADDONS.filter((addon) => this.selectedAddonIds.includes(addon.id));
  }

  hasAddon(addonId) {
    return this.getMatchedAddons().some((addon) => addon.id === addonId);
  }

  findAddon(addonId) {
    return AVAILABLE_ADDONS.find((addon) => addon.id === addonId) || null;
  }
}

class PaymentTransaction {
  constructor(bookingRecord, amount, methodCode) {
    this.transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    this.bookingId = bookingRecord.bookingId;
    this.amount = Number(amount) || 0;
    this.method = getPaymentMethodDetails(methodCode);
    this.status = "INITIATED";
    this.timestamp = new Date().toISOString();
  }

  markSuccess() {
    this.status = "PAID";
    return this;
  }

  markFailed(reason) {
    this.status = "FAILED";
    this.failureReason = reason || "Payment declined";
    return this;
  }
}

// ----------------------------------------------------------------------------
// 7. DOM Selection, Event Mechanics & Live Fare Calculation
// ----------------------------------------------------------------------------
function getSelectedAddonIdsFromDOM() {
  const checkedBoxes = document.querySelectorAll('input[name="addons"]:checked');
  return Array.from(checkedBoxes).map((el) => el.value);
}

function updateLiveFareBreakdownDOM() {
  const roomSelect = document.querySelector("#roomType");
  const roomsInput = document.querySelector("#roomsCount");
  const checkInInput = document.querySelector("#checkInDate");
  const checkOutInput = document.querySelector("#checkOutDate");
  const promoInput = document.querySelector("#promoCode");
  const methodInput = document.querySelector('input[name="paymentMethod"]:checked');
  const totalDisplay = document.querySelector("#totalPayableAmount");

  if (!roomSelect || !totalDisplay) {
    return null;
  }

  const nights = calculateStayNights(checkInInput?.value, checkOutInput?.value);
  const baseFareInfo = calculateBaseFare(
    roomSelect.value,
    Number(roomsInput?.value || 1),
    nights
  );
  const selectedAddons = getSelectedAddonIdsFromDOM();
  const addonsTotal = calculateAddonsTotal(selectedAddons);
  const promoInfo = evaluatePromoCode(
    promoInput?.value,
    baseFareInfo.grandTotal + addonsTotal
  );
  const methodInfo = getPaymentMethodDetails(methodInput?.value || "upi");

  const estimator = new FareEstimator(
    baseFareInfo.grandTotal,
    addonsTotal,
    promoInfo.promoDiscount,
    methodInfo.gatewayFeeRate
  );
  const netSummary = estimator.getNetPayable();

  totalDisplay.textContent = `₹${netSummary.finalPayable.toLocaleString("en-IN")}`;
  return { baseFareInfo, addonsTotal, promoInfo, methodInfo, netSummary };
}

function attachBookingDomListeners() {
  const form = document.querySelector("#bookingPaymentForm");
  if (!form) {
    return;
  }

  form.addEventListener("change", (event) => {
    const target = event.target;
    if (
      target.matches(
        "#roomType, #roomsCount, #checkInDate, #checkOutDate, input[name='addons'], input[name='paymentMethod']"
      )
    ) {
      updateLiveFareBreakdownDOM();
    }
  });

  const promoInput = document.querySelector("#promoCode");
  if (promoInput) {
    promoInput.addEventListener("input", () => {
      updateLiveFareBreakdownDOM();
    });
  }
}

// ----------------------------------------------------------------------------
// 8. Async Programming (Promises & Async/Await) + jQuery & AJAX
// ----------------------------------------------------------------------------
function authorizePaymentPromise(transaction) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (transaction.amount <= 0) {
        reject(new Error("Invalid payable amount for payment authorization."));
        return;
      }

      const isAuthorized = Math.random() < 0.9;
      if (isAuthorized) {
        transaction.markSuccess();
        resolve({
          success: true,
          transactionId: transaction.transactionId,
          bookingId: transaction.bookingId,
          amount: transaction.amount,
          method: transaction.method.label,
          paidAt: transaction.timestamp
        });
      } else {
        transaction.markFailed("Gateway timeout or bank declined transaction.");
        reject(new Error(transaction.failureReason));
      }
    }, 1200);
  });
}

async function processBookingPaymentAsync(bookingRecord, methodCode, finalAmount) {
  const statusBox = document.querySelector("#paymentStatusMessage");
  const submitBtn = document.querySelector("#payNowBtn");

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing Payment...";
    }
    if (statusBox) {
      statusBox.textContent = "Authorizing payment with resort billing gateway...";
    }

    const txn = new PaymentTransaction(bookingRecord, finalAmount, methodCode);
    const receipt = await authorizePaymentPromise(txn);
    bookingRecord.status = "CONFIRMED";

    if (statusBox) {
      statusBox.textContent = `Booking Confirmed! ID: ${receipt.bookingId} | Txn: ${receipt.transactionId}`;
    }

    return { ok: true, receipt, bookingRecord };
  } catch (error) {
    if (statusBox) {
      statusBox.textContent = `Payment Failed: ${error.message}`;
    }
    return { ok: false, error: error.message };
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Pay & Confirm Booking";
    }
  }
}

function submitBookingViaAjax(payload) {
  if (typeof window.$ === "undefined" || typeof window.$.ajax !== "function") {
    return Promise.resolve({
      status: "local_preview",
      message: "Booking payload ready without jQuery AJAX.",
      payload
    });
  }

  return new Promise((resolve) => {
    window.$.ajax({
      url: "/api/bookings/confirm-payment",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      timeout: 5000,
      success: function (response) {
        resolve(response);
      },
      error: function (_xhr, statusText) {
        resolve({
          status: "queued_offline",
          transport: statusText,
          message: "Payment processed locally; backend API not connected.",
          payload
        });
      }
    });
  });
}

(function initBookingPaymentModule() {
  document.addEventListener("DOMContentLoaded", () => {
    attachBookingDomListeners();
    updateLiveFareBreakdownDOM();

    const form = document.querySelector("#bookingPaymentForm");
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = {
          guestName: document.querySelector("#guestName")?.value,
          email: document.querySelector("#guestEmail")?.value,
          phone: document.querySelector("#guestPhone")?.value,
          paymentMethod:
            document.querySelector('input[name="paymentMethod"]:checked')?.value || "upi",
          upiId: document.querySelector("#upiId")?.value,
          cardNumber: document.querySelector("#cardNumber")?.value,
          expiry: document.querySelector("#cardExpiry")?.value,
          cvv: document.querySelector("#cardCvv")?.value,
          promoCode: document.querySelector("#promoCode")?.value
        };

        const validation = validateGuestAndPaymentForm(formData);
        if (!validation.isValid) {
          const firstError = Object.values(validation.errors)[0];
          const statusBox = document.querySelector("#paymentStatusMessage");
          if (statusBox) {
            statusBox.textContent = firstError;
          }
          return;
        }

        const liveSummary = updateLiveFareBreakdownDOM();
        const booking = new BookingRecord({
          guestName: formData.guestName,
          email: formData.email,
          phone: formData.phone,
          roomType: document.querySelector("#roomType")?.value,
          roomsCount: document.querySelector("#roomsCount")?.value,
          nights: liveSummary?.baseFareInfo?.nights || 1,
          selectedAddonIds: getSelectedAddonIdsFromDOM(),
          promoCode: formData.promoCode
        });

        const payableAmount = liveSummary?.netSummary?.finalPayable || 0;
        const paymentResult = await processBookingPaymentAsync(
          booking,
          formData.paymentMethod,
          payableAmount
        );

        if (paymentResult.ok) {
          await submitBookingViaAjax({
            booking: paymentResult.bookingRecord,
            receipt: paymentResult.receipt
          });

          if (typeof window.$ !== "undefined") {
            window
              .$('input[name="paymentMethod"]')
              .closest(".payment-option")
              .removeClass("active-method");
            window
              .$('input[name="paymentMethod"]:checked')
              .closest(".payment-option")
              .addClass("active-method");
            window.$("#confirmationCard").slideDown(300).fadeIn(200);
          }
        }
      });
    }

    if (typeof window.$ !== "undefined") {
      window.$('input[name="paymentMethod"]').on("change", function () {
        const selectedVal = window.$(this).val();
        window.$(".payment-fields-panel").slideUp(200);
        window.$(`#panel-${selectedVal}`).slideDown(250);
      });
    }
  });
})();