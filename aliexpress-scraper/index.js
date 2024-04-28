const fetch = require("node-fetch");
const mongodb = require("./mongodb/mongodb.connect");

const options = {
  credentials: "include",
  headers: {
    accept: "application/json",
    "amp-same-origin": "true",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    referer:
      "https://m.aliexpress.com/wholesale/watches.html?channel=direct&keywords=watches&trafficChannel=main&d=y&CatId=0&SearchText=watches&ltype=wholesale&SortType=default&page=2"
  },
  referrer:
    "https://m.aliexpress.com/wholesale/watches.html?channel=direct&keywords=watches&trafficChannel=main&d=y&CatId=0&SearchText=watches&ltype=wholesale&SortType=default&page=2",
  referrerPolicy: "no-referrer-when-downgrade",
  body: null,
  method: "GET",
  mode: "cors"
};

async function main() {
  const mongoClient = await mongodb();
  const aliDb = mongoClient.db("aliexpress");
  const watches = aliDb.collection("watches");
  let totalItems = 1000;
  for (let startOffset = 20; startOffset < totalItems; startOffset += 20) {
    const response = await fetch(
      `https://m.aliexpress.com/api/search/products/watches/items?pageId=2277amp-MgR4_RbVePaBni_NMFpHjA1585613006491&searchType=mainSearch&channel=direct&infiniteScroll=true&start=${startOffset}&shipToCountry=US&__amp_source_origin=https%3A%2F%2Fm.aliexpress.com`,
      options
    );
    const json = await response.json();
    totalItems = json.data.refine.base.totalNum;
    console.log(json.data.items);
    await watches.insertMany(json.data.items);
    await sleep(5000);
  }
}

async function sleep(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
}

main();
