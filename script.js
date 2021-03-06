let currency = document.getElementById("currency-selection").value;
let time = document.getElementById("time-selection").value.split(" ")[0];
let charts = {};
let intervalIDs = [];

const runForCoins = function (fnc, currency, days) {
  fnc("bitcoin", currency, days);
  fnc("ethereum", currency, days);
  fnc("dogecoin", currency, days);
  fnc("cardano", currency, days);
};

const getData = async function (coin, currency, days) {
  let data = await (
    await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=${currency}&days=${days}`
    )
  ).json();
  (x = data.prices.map((price) => price[0])),
    (y = data.prices.map((price) => price[1])),
    updateChart(x, y, coin);
};

const updateChart = function (x, y, coin) {
  let coords = [];
  x.forEach((currentValue, index, arr) => {
    coords.push({
      x: currentValue,
      y: y[index],
    });
  });
  console.log(coords);
  // const labels = x.concat([1]);
  const data = {
    datasets: [
      {
        label: "My First dataset",
        borderColor: "rgb(200,120,0)",
        data: coords,
      },
    ],
  };
  config.data = data;
  config.options.scales.xAxes.min = coords.reduce((acc, cur) =>
    cur.x < acc.x ? cur : acc
  ).x;
  if (charts[coin]) {
    charts[coin].data = data;
    charts[coin].update();
  } else {
    charts[coin] = new Chart(document.getElementById(`${coin}-chart`), config);
  }
};

const updatePrice = async function (coin, currency) {
  let data = await (
    await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${currency}`
    )
  ).json();
  let price = data[coin][currency.toLowerCase()];
  document.getElementById(
    `${coin}-price`
  ).textContent = `${price} ${currency.toUpperCase()}`;
};

currencySelectionElement = document.getElementById("currency-selection");
currencySelectionElement.addEventListener("change", () => {
  currency = currencySelectionElement.value;
  runForCoins(updatePrice, currency);
  runForCoins(getData, currency, time);
  intervalIDs.forEach((currentValue) => {
    clearInterval(currentValue);
  });
  runForCoins((coin, currency) => {
    intervalIDs.push(setInterval(updatePrice, 15000, coin, currency));
  }, currency);
});

timeSelectionElement = document.getElementById("time-selection");
timeSelectionElement.addEventListener("change", () => {
  time = timeSelectionElement.value.split(" ")[0];
  runForCoins(getData, currency, time);
});

runForCoins(updatePrice, currency);
runForCoins((coin, currency) => {
  intervalIDs.push(setInterval(updatePrice, 15000, coin, currency));
}, currency);
runForCoins(getData, currency, time);
