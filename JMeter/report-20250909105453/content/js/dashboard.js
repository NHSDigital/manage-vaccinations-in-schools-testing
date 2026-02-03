/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 76.02193419740777, "KoPercent": 23.978065802592223};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4319330999611046, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.017857142857142856, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6956521739130435, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.7357142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.058823529411764705, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.003080082135523614, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.125, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.0, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0847457627118644, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0056179775280898875, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2006, 481, 23.978065802592223, 14770.239282153518, 0, 80423, 133.0, 49637.299999999996, 57472.7, 60361.0, 1.8601977039633526, 17.792241929155306, 0.7363050145241009], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 487, 469, 96.30390143737166, 55972.62012320328, 117, 109307, 53242.0, 85823.4, 89973.4, 105242.48, 0.48143033248349837, 15.640315973564334, 0.4986964016419048], "isController": true}, {"data": ["2.5 Select patient", 3, 0, 0.0, 2095.6666666666665, 1730, 2442, 2115.0, 2442.0, 2442.0, 2442.0, 0.11334013374135782, 2.582361972968378, 0.07884370631682346], "isController": false}, {"data": ["Choose session", 487, 0, 0.0, 0.560574948665298, 0, 46, 0.0, 1.0, 1.0, 1.0, 0.5123489780373772, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 1, 0, 0.0, 900.0, 900, 900, 900.0, 900.0, 900.0, 900.0, 1.1111111111111112, 25.840928819444443, 0.8333333333333333], "isController": false}, {"data": ["2.3 Search by first/last name", 56, 35, 62.5, 38817.00000000001, 312, 60374, 38250.0, 60125.0, 60128.0, 60374.0, 0.05608008235760666, 1.5695909853020114, 0.04900259289014713], "isController": false}, {"data": ["2.5 Select td_ipv", 1, 0, 0.0, 2814.0, 2814, 2814, 2814.0, 2814.0, 2814.0, 2814.0, 0.35536602700781805, 8.657882462686567, 0.24778451492537312], "isController": false}, {"data": ["4.0 Vaccination for flu", 1, 0, 0.0, 6526.0, 6526, 6526, 6526.0, 6526.0, 6526.0, 6526.0, 0.15323322096230463, 6.919437634079069, 0.9096726076463377], "isController": true}, {"data": ["4.0 Vaccination for hpv", 1, 0, 0.0, 8971.0, 8971, 8971, 8971.0, 8971.0, 8971.0, 8971.0, 0.11147029316687103, 4.789848017222161, 0.6652294546315907], "isController": true}, {"data": ["1.2 Sign-in page", 69, 1, 1.4492753623188406, 5361.028985507246, 122, 43858, 149.0, 20947.0, 27402.5, 43858.0, 0.07442787615201409, 0.43400565672083724, 0.044845702720500674], "isController": false}, {"data": ["Get correct patient name", 13, 0, 0.0, 4.230769230769231, 1, 41, 1.0, 25.399999999999984, 41.0, 41.0, 0.013310875497237994, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 6, 3, 50.0, 29906.5, 23302, 37781, 30322.0, 37781.0, 37781.0, 37781.0, 0.020602131633886384, 1.2476025878852597, 0.03066176622074497], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 147.0, 147, 147, 147.0, 147.0, 147.0, 147.0, 6.802721088435374, 32.3860012755102, 4.969175170068027], "isController": false}, {"data": ["1.1 Homepage", 70, 1, 1.4285714285714286, 4454.9, 371, 31366, 458.5, 23570.999999999996, 27854.45, 31366.0, 0.07684429041433344, 0.41725977994539665, 0.04164900505854986], "isController": false}, {"data": ["1.3 Sign-in", 68, 9, 13.235294117647058, 18235.294117647063, 1048, 80423, 3089.5, 55329.100000000006, 65976.99999999997, 80423.0, 0.06763315775235124, 0.8834183000778776, 0.14572326886467799], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 1, 0, 0.0, 8979.0, 8979, 8979, 8979.0, 8979.0, 8979.0, 8979.0, 0.11137097672346585, 5.325142346029625, 0.6759478714222075], "isController": true}, {"data": ["2.1 Open session", 487, 309, 63.449691991786445, 36948.13141683776, 117, 60393, 35668.0, 56029.799999999996, 60255.399999999994, 60375.12, 0.49318053850858967, 3.0436330436783776, 0.32601531138224227], "isController": false}, {"data": ["4.3 Vaccination confirm", 4, 0, 0.0, 4286.0, 3439, 4695, 4505.0, 4695.0, 4695.0, 4695.0, 0.027520915896081022, 0.5498740810594177, 0.06403853745252643], "isController": false}, {"data": ["4.1 Vaccination questions", 4, 0, 0.0, 2048.5, 1238, 2438, 2259.0, 2438.0, 2438.0, 2438.0, 0.029678874577076037, 0.34192295225040065, 0.06160395304060069], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 70, 12, 17.142857142857142, 33273.31428571428, 2406, 134450, 8512.5, 102905.69999999998, 116867.80000000002, 134450.0, 0.06946567006585345, 2.9748508457321283, 0.25929553778585124], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 1, 0, 0.0, 9053.0, 9053, 9053, 9053.0, 9053.0, 9053.0, 9053.0, 0.11046062078868883, 5.169319735170661, 0.6589882152325195], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 900.0, 900, 900, 900.0, 900.0, 900.0, 900.0, 1.1111111111111112, 28.84982638888889, 0.7237413194444444], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 781.0, 781, 781, 781.0, 781.0, 781.0, 781.0, 1.2804097311139564, 22.791043133802816, 0.8340168854033291], "isController": false}, {"data": ["2.5 Select hpv", 1, 0, 0.0, 1246.0, 1246, 1246, 1246.0, 1246.0, 1246.0, 1246.0, 0.8025682182985554, 17.785037118780096, 0.5987911316211878], "isController": false}, {"data": ["2.5 Select flu", 1, 0, 0.0, 1907.0, 1907, 1907, 1907.0, 1907.0, 1907.0, 1907.0, 0.5243838489774515, 12.02703034871526, 0.39123951232302046], "isController": false}, {"data": ["Debug Sampler", 491, 0, 0.0, 0.7372708757637477, 0, 12, 0.0, 2.0, 3.0, 4.0, 0.49580834937221174, 4.038208443926701, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 59, 1, 1.694915254237288, 6904.745762711865, 808, 39683, 2405.0, 22548.0, 27232.0, 39683.0, 0.062052094310769516, 1.3957232878223291, 0.03708582199042084], "isController": false}, {"data": ["4.2 Vaccination batch", 4, 0, 0.0, 2047.75, 1849, 2150, 2096.0, 2150.0, 2150.0, 2150.0, 0.029283005607695572, 0.41533825531852586, 0.04633377913659058], "isController": false}, {"data": ["2.2 Session register", 178, 122, 68.53932584269663, 38789.99438202248, 344, 65602, 43680.5, 60121.0, 60128.0, 61733.37000000004, 0.1804166814479959, 6.980979953033382, 0.12425125968599389], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 115.0, 115, 115, 115.0, 115.0, 115.0, 115.0, 8.695652173913043, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 412, 85.65488565488566, 20.53838484546361], "isController": false}, {"data": ["504/Gateway Time-out", 69, 14.345114345114345, 3.439680957128614], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2006, 481, "502/Bad Gateway", 412, "504/Gateway Time-out", 69, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 56, 35, "502/Bad Gateway", 26, "504/Gateway Time-out", 9, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 69, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 6, 3, "502/Bad Gateway", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 70, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 68, 9, "502/Bad Gateway", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 487, 309, "502/Bad Gateway", 281, "504/Gateway Time-out", 28, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.5 Open Sessions list", 59, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 178, 122, "502/Bad Gateway", 90, "504/Gateway Time-out", 32, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
