// console.log('This is console for background js ');
// let ListArray = []
// let LinkArray = []
// let combinedArray = []
// var maxTabs = 30;
// var currentTabs = 0;
// var openedTabs = 0;

// var timestart;
// chrome.runtime.onMessage.addListener(function (request) {
//     if (request.message === "GetEtrade") {
//         console.log(request.Data, ":For Request Etrade");
//         ListArray.push(request.Data);
//     }
//     if (request.message == "gettime") {
//         console.log(request.time);
//         timestart = request.time
//     }

//     if (request.greeting === "hello") {
//         console.log(LinkArray, "For LinkArray");
//         console.log('mess age accpect', request.data);
//         const receive_object = request.data;



//         for (var i = 0; i < LinkArray.length; i++) {
//             (function (i) {
//                 setTimeout(() => {
//                     chrome.tabs.create({
//                         url: LinkArray[i]
//                     }, function (tab) {});
//                     console.log(timestart, ":For timeStart");
//                 }, timestart * i);
//             })(i);
//         }
//     }

//     if (request.message == "UrlData") {
//         let asin = request.exel
//         console.log(asin, "For asin");
//         asin.map((item) => {
//             LinkArray.push(`https://amazon.in/dp/${item}`);
//         });
//     }
// });

// // **************************************Geting Message Form content js ***************************
// chrome.runtime.onMessage.addListener(function (request, sender) {
//     if (request.message === "FirstObj") {
//         console.log(request.Data, "request.Data::Firstobj>>>>>");
//         combinedArray.push(request.Data);
//         console.log(combinedArray);
//     }
//     if (request.message === "ScondObj") {
//         console.log(request.Data, "request.Data::Scond Obj>>>>>>>");
//         combinedArray.push(request.Data);
//         console.log(combinedArray)
//     }


//     if (request.message == "closeTab") {
//         chrome.tabs.remove(sender.tab.id, function () {
//             // console.log("Tab with ID " + sender.tab.id + " has been closed.");
//         });
//     }
//     if (request.greeting == "downloadexelsheet") {
//         console.log('message recived downloadexelsheet')
//         chrome.runtime.sendMessage({
//             message: "extactfile",
//             Data: combinedArray,
//         });
//     }
// })

console.log('This is console for background js ');
let ListArray = [];
let LinkArray = [];
let combinedArray = [];
let openedTabIds = [];  // Store opened tab IDs to close them later
let stopOpeningTabs = false;  // Flag to control opening new tabs
let currentTabs = 0;  // Track the number of currently opened tabs
const maxTabs = 30;  // Limit for maximum number of open tabs

var timestart;

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.message === "GetEtrade") {
        console.log(request.Data, ":For Request Etrade");
        ListArray.push(request.Data);
    }

    if (request.message === "FirstObj") {
        console.log(request.Data, "request.Data::Firstobj>>>>>");
        combinedArray.push(request.Data);
        console.log(combinedArray);
    }

    if (request.message === "ScondObj") {
        console.log(request.Data, "request.Data::Scond Obj>>>>>>>");
        combinedArray.push(request.Data);
        console.log(combinedArray)
    }

    if (request.message == "closeTab") {
        chrome.tabs.remove(sender.tab.id, function () {
            // console.log("Tab with ID " + sender.tab.id + " has been closed.");
        });
    }

    if (request.message == "gettime") {
        console.log(request.time);
        timestart = request.time;
    }

    if (request.greeting === "hello") {
        console.log(LinkArray, "For LinkArray");
        console.log('message accepted', request.data);

        stopOpeningTabs = false;  // Reset the flag to allow opening tabs
        const receive_object = request.data;

        openTabs();  // Start opening tabs
    }

    if (request.message == "UrlData") {
        let asin = request.exel;
        console.log(asin, "For asin");
        asin.map((item) => {
            LinkArray.push(`https://amazon.in/dp/${item}`);
        });
    }

    if (request.message == "stopTabs") {
        stopOpeningTabs = true;  // Stop opening new tabs
        closeAllOpenedTabs();  // Close all opened tabs
    }

        if (request.greeting == "downloadexelsheet") {
        console.log('message recived downloadexelsheet')
        chrome.runtime.sendMessage({
            message: "extactfile",
            Data: combinedArray,
        });
    }
});

// Function to open tabs with a limit of 30 at a time
function openTabs() {
    let openedTabs = 0;

    function openNextTab() {
        if (openedTabs >= LinkArray.length || stopOpeningTabs) return;  // Stop if all tabs opened or flag is set

        // Only open more tabs if the current count is less than the max allowed
        if (currentTabs < maxTabs) {
            chrome.tabs.create({
                url: LinkArray[openedTabs]
            }, function (tab) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    return;
                }
                currentTabs++;
                openedTabIds.push(tab.id);  // Track opened tab ID
                openedTabs++;
            });
        }

        // Check again after `timestart` delay to open more tabs
        setTimeout(openNextTab, timestart);
    }

    openNextTab();
}

// Function to close all opened tabs
function closeAllOpenedTabs() {
    for (let tabId of openedTabIds) {
        chrome.tabs.remove(tabId, function () {
            console.log(`Closed tab with ID ${tabId}`);
        });
    }
    openedTabIds = [];  // Clear the list after closing all tabs
}

// Listen for when a tab is closed and update the current open tab count
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    currentTabs--;
});

