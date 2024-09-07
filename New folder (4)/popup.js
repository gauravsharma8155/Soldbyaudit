console.log("Popup js");
let last_result_obj = [];
document.getElementById("sendMessage").addEventListener("click", function () {
    console.log('hyyy');
    let textArea = `${document.querySelector("#textArea")?.value}`;
    console.log(textArea, ":textArea");
    const asinArray = textArea.trim().split("\n").map(asin => asin.trim());
    console.log(asinArray, "asinArray");
    const selectedValue = document.getElementById('selectInput').value;
    console.log('Button 1 clicked, text:', 'selected value:', selectedValue);
    chrome.runtime.sendMessage({
        message: "gettime",
        time: selectedValue
    });

    chrome.runtime.sendMessage({
        message: "UrlData",
        exel: asinArray
    });
    chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
        console.log("Response from background:", response);
    });
});

// **************************** Extract Asin From Exel Sheet *****************************************************//

document.getElementById('input-file').addEventListener('change', handleFile, false);
let filterproduct = [];
let highratingproduct = [];
function handleFile(event) {
    console.log('hyy');
    const file = event.target.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {

            console.log('hyy');
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assuming the first sheet is the one you want to read
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // Convert the worksheet to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log(jsonData);
            chrome.runtime.sendMessage({
                message: "UrlData",
                exel: jsonData
            });

        } catch (error) {
            console.error("Error reading file:", error);
        }
    };
    reader.onerror = function (ex) {
        console.error("File could not be read! Code " + ex.target.error.code);
    };
    reader.readAsArrayBuffer(file);
}


// **************************************** Download ExelSheet ***************************************
document.getElementById("downloadExcel").addEventListener("click", () => {

    chrome.runtime.sendMessage({ greeting: "downloadexelsheet" }, function (response) {
        console.log("Response from background:", response);
    });
});

// ************************************* Make Exel Sheet Using This Code **********************************




chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == "extactfile") {
        console.log('inside the message');
        console.log('Received data: ', request.Data);
        const bundlearray = request.Data;
        function removeDuplicateAsins(array) {
            const seenAsins = new Set();
            const result = [];

            for (const subArray of array) {
                if (Array.isArray(subArray)) {
                    const newSubArray = [];
                    for (const item of subArray) {
                        if (item.Asin) {
                            if (!seenAsins.has(item.Asin)) {
                                seenAsins.add(item.Asin);
                                newSubArray.push(item);
                            }
                        } else {
                            newSubArray.push(item);
                        }
                    }
                    if (newSubArray.length > 0) {
                        result.push(newSubArray);
                    }
                } else {
                    // Handle non-array items directly
                    if (subArray.Asin && !seenAsins.has(subArray.Asin)) {
                        seenAsins.add(subArray.Asin);
                        result.push([subArray]); // Wrap in an array for consistency
                    } else if (!subArray.Asin) {
                        result.push([subArray]); // Non-array and no Asin
                    }
                }
            }

            return result;
        }

        const result = removeDuplicateAsins(bundlearray);

        console.log(result, "Processed result");
        const result_data = result.filter(group => group.some(item => item.hasOwnProperty("Asin")));

        console.log(result_data, "Filtered result");

        const transformedData = result_data.map(group => {
            let base = { ...group[0] };
        
            group.slice(1).forEach((item, index) => {
                base[`price${index + 1}`] = item.price;
                base[`soldby${index + 1}`] = item.soldby;
            });
        
            return base;
        });
        
        console.log(transformedData, "transformedData");

        // const flatedata = result_data.flat();
        // console.log(flatedata, ": For FlateData");



        // function flattenData(data) {
        //     return data.flat(); // Flatten the nested arrays into a single array
        // }
        // const exel_sheet = flattenData(result_data);
    
        // const data = exel_sheet;
        // console.log(data, "exelsheetdataerror");

        // Function to process each object in the data
        // const processData = (data) => {
        //     return data.map(itemGroup => {
        //         const row = [];
        //         let priceIndex = 1;
        //         console.log(itemGroup, "itemGroup")
        //         itemGroup.forEach(item => {
        //             if (item.price) {
        //                 row.push({ [`Price ${priceIndex}`]: item.price, [`SoldBy ${priceIndex}`]: item.soldby });
        //                 priceIndex++;
        //             }
        //         });

        //         // Flatten the row into a single object
        //         return Object.assign({}, ...row);
        //     });
        // };

        // // Process the data
        // const rows = processData(transformedData);

        // // Create headers based on maximum number of prices
        // const maxPrices = Math.max(...rows.map(row => Object.keys(row).filter(key => key.startsWith('Price')).length));
        // const headers = [];
        // for (let i = 1; i <= maxPrices; i++) {
        //     headers.push(`Price ${i}`, `SoldBy ${i}`);
        // }

        // // Adding headers to the rows
        // rows.unshift(headers);

        // Creating the worksheet
        // const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
        const worksheet = XLSX.utils.json_to_sheet(transformedData);
// 

        // Creating the workbook and adding the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Exporting the workbook
        XLSX.writeFile(workbook, "ProductData.xlsx");

    }
});


