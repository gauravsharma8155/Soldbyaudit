setTimeout(() => {
    chrome.runtime.sendMessage({
        message: "closeTab"
    });
    window.close();
}, 4000);

console.log("This is console for content js ");
let Url = location.href;
let price_details_array = [];
let sendpopuparray = []
let stopsendata = true;
// console.log(Url, ":For Url");

function getASIN(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const asinMatch = pathname.match(/\/dp\/([^\/]+)/);
    return asinMatch ? asinMatch[1] : null;
}
const main_asin = getASIN(Url)


const observeChanges = (targetNode, callback, config = { childList: true, subtree: true }) => {
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                callback();
            }
        }
    });
    observer.observe(targetNode, config);
    return observer;
};

let pinned_offer = document.querySelector('#aod-pinned-offer-main-content-show-more');
let dynamic = document.querySelector('#dynamic-aod-ingress-box');

if (pinned_offer || dynamic) {
    console.log("Pined_offer", "dynamic");
    // console.log("Inside the if condition");
    let v = pinned_offer || dynamic?.querySelector(".a-declarative")?.click();
    // console.log(v);
}
else {
    let price = document.querySelector("span.a-price-whole") ? document.querySelector("span.a-price-whole").textContent.trim() : null;
    let soldBy = document.querySelector('div.tabular-buybox-text[tabular-attribute-name="Sold by"] span.a-size-small.tabular-buybox-text-message a') ? document.querySelector('div.tabular-buybox-text[tabular-attribute-name="Sold by"] span.a-size-small.tabular-buybox-text-message a').textContent.trim() : null;
    let Deal = document.querySelector('span.dealBadgeTextColor') && document.querySelector('span.dealBadgeTextColor').textContent.includes('Limited time deal') ? 'Available' : 'NA';
    const images = document.querySelectorAll('#altImages img');
    const imageUrls = [];
    images.forEach(img => {
        imageUrls.push(img.src);
    });
    let imagecount = images?.length
    console.log(soldBy, price, "soldbyprice");
    const mainobje = { Asin: main_asin, soldBy, price, Deal, imagecount };
    sendpopuparray.push(mainobje);
    if (stopsendata) {
        chrome.runtime.sendMessage({
            message: "FirstObj",
            Data: mainobje
        });
        stopsendata = false
    }
    chrome.runtime.sendMessage({
        message: "closeTab"
    });

    console.log('not found pinned offer, and dynamic offer');
}

const targetNode = document.querySelector('body'); // or any specific element that might change

observeChanges(targetNode, () => {
    let getSoldBy = document.querySelectorAll('#aod-offer-soldBy');
    console.log(getSoldBy, ": For getSoldBy");
    console.log(getSoldBy.length, ": FOR GETSOLDBYLENGTH");

    const getSoldByLength = getSoldBy.length;
    console.log(getSoldByLength, "sffkjfksf>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>....");

    // Loop through each 'Sold by' element
    for (let i = 0; i < getSoldByLength; i++) {
        const element = getSoldBy[i]; // Use getSoldBy[i] instead of getSoldByLength[i]
        console.log(i, ": Index");
        console.log(element, ": For element");
        let aod_price = document.querySelector(`#aod-price-${i}`);
        console.log(aod_price, "aod__________price__________ ");
        let price_details_data = aod_price?.querySelector(".a-offscreen")?.textContent;
        console.log(price_details_data, "price_details_data");
        price_details_array.push(price_details_data)

    }
    let price = document.querySelector("span.a-price-whole") ? document.querySelector("span.a-price-whole").textContent.trim() : null;
    // console.log(price, ":For Price");

    const soldBy = Array.from(getSoldBy).map((dom, index) => {
        console.log(dom);
        let anker = dom.querySelector("a")?.textContent
        return anker
    });
    console.log(soldBy, ":For soldBy");
    console.log(price_details_array, ":For price_details_array");
    let newprice_details_array = new Set([...price_details_array]);
    console.log(Array.from(newprice_details_array), "newprice_details_array");
    let newobjnewprice = Array.from(newprice_details_array).slice(0, -1);
    console.log(newobjnewprice, ":For newobjnewprice");

    let newsoldbyarray = soldBy.slice(1);
    console.log(newsoldbyarray, ": For newsoldbyarraynewsoldbyarray");
    let combinedArray = newobjnewprice.map((price, index) => {
        return {
            Asin: main_asin,
            price: price,  // Keeping the price in its original format
            soldby: newsoldbyarray[index] || null,
        };
    });

    console.log(combinedArray, ":for combinedArray");
    if (combinedArray.length > 0) {
        console.log(combinedArray, "For Combinearray");
        let Deal = document.querySelector('span.dealBadgeTextColor') && document.querySelector('span.dealBadgeTextColor').textContent.includes('Limited time deal') ? 'Available' : 'NA';
        // Remove the 'Asin' property from each object
        const pricesAndSellers = combinedArray.map(({ Asin, ...rest }) => rest);
        const images = document.querySelectorAll('#altImages img');
        const imageUrls = [];
        images.forEach(img => {
            imageUrls.push(img.src);
        });
        let imagecount = images?.length

        // Add the ASIN object at the beginning of the array
        const result = [{ Asin: main_asin, Deal,imagecount }, ...pricesAndSellers];
        console.log(result, "For result>>>>>>>");
        if (stopsendata) {
            chrome.runtime.sendMessage({
                message: "ScondObj",
                Data: result
            });
            stopsendata = false
        }
        // chrome.runtime.sendMessage({
        //     message: "ScondObj",
        //     Data: result
        // });
        chrome.runtime.sendMessage({
            message: "closeTab"
        })
    }
});