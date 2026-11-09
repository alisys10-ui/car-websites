/* Car Advisor Chicago: fixed 10% sales tax, fixed $775 fees, no down payment. */
(() => {
  'use strict';
  const section = document.querySelector('[data-calculator-lang]');
  if (!section) return;
  const inputs = Object.fromEntries(
    [...section.querySelectorAll('[data-loan-input]')].map(el => [el.dataset.loanInput, el])
  );
  const paymentEl = section.querySelector('#loan-payment');
  const financedEl = section.querySelector('#loan-financed');
  const interestEl = section.querySelector('#loan-interest');
  const totalEl = section.querySelector('#loan-total');
  const errorEl = section.querySelector('#loan-error');
  const scheduleBody = section.querySelector('#loan-amortization');
  const money = n => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(n);
  function calculate() {
    const price = Number(inputs.price.value);
    const apr = Number(inputs.apr.value);
    const months = Number(inputs.term.value);
    const valid = inputs.price.value.trim() !== '' && inputs.apr.value.trim() !== '' &&
      Number.isFinite(price) && price > 0 && Number.isFinite(apr) && apr >= 0 &&
      apr <= 100 && Number.isInteger(months) && months > 0;
    const principal = price * 1.10 + 775;
    if (!valid || !Number.isFinite(principal) || principal > 10000000) {
      [paymentEl, financedEl, interestEl, totalEl].forEach(el => el.textContent = '—');
      scheduleBody.replaceChildren();
      errorEl.hidden = false;
      return;
    }
    const monthlyRate = apr / 1200;
    const monthly = monthlyRate === 0
      ? principal / months
      : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    if (!Number.isFinite(monthly) || monthly <= 0) {
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    let balance = principal, totalInterest = 0, totalPaid = 0;
    const fragment = document.createDocumentFragment();
    for (let month = 1; month <= months; month++) {
      const interest = balance * monthlyRate;
      const due = balance + interest;
      const installment = month === months ? due : Math.min(due, monthly);
      const capital = installment - interest;
      balance = Math.max(0, balance - capital);
      totalInterest += interest;
      totalPaid += installment;
      const row = document.createElement('tr');
      [String(month), money(installment), money(capital), money(interest), money(balance)]
        .forEach(value => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);
        });
      fragment.appendChild(row);
    }
    paymentEl.textContent = money(monthly);
    financedEl.textContent = money(principal);
    interestEl.textContent = money(totalInterest);
    totalEl.textContent = money(totalPaid);
    scheduleBody.replaceChildren(fragment);
  }
  Object.values(inputs).forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });
  calculate();
})();
