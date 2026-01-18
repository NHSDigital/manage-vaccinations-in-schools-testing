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

    var data = {"OkPercent": 99.94600431965442, "KoPercent": 0.05399568034557235};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5720774326629379, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.44706632653061223, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.002570694087403599, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9104153750774954, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.9010448678549478, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.002512562814070352, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0025252525252525255, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.742979242979243, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.47910135841170326, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5993276283618582, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.7666244458518049, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7576312576312576, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6430317848410758, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8814496314496314, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0025252525252525255, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4641982864137087, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20372, 11, 0.05399568034557235, 606.2189770272945, 0, 3720, 539.0, 1013.0, 1229.9500000000007, 1734.0, 5.658280623721839, 107.71186173007234, 6.572078332308443], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1568, 0, 0.0, 1114.2436224489782, 788, 3398, 1005.5, 1519.0, 1741.6499999999999, 2482.6399999999976, 0.4542306164761148, 9.185616087208802, 1.0578697441382379], "isController": false}, {"data": ["4.1 Vaccination questions", 1582, 0, 0.0, 723.8160556257901, 430, 2618, 649.0, 938.1000000000001, 1187.85, 1639.0, 0.45087140446442486, 4.932204489793548, 0.952412571257347], "isController": false}, {"data": ["2.0 Register attendance", 1620, 11, 0.6790123456790124, 2804.220370370373, 1566, 6654, 2729.0, 3680.0, 4009.6499999999987, 4854.32, 0.4535320064815883, 52.263420253973024, 1.6702383478668879], "isController": true}, {"data": ["1.0 Login", 1636, 0, 0.0, 2456.81479217604, 1580, 5128, 2349.0, 3094.3, 3390.1499999999996, 4118.299999999999, 0.4564415028085381, 35.98335296320094, 2.2652836955000897], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 389, 0, 0.0, 2352.102827763495, 1096, 4612, 2253.0, 2902.0, 3360.5, 3723.700000000002, 0.11219152737660734, 4.978614504035578, 0.6790001714237509], "isController": true}, {"data": ["2.5 Select patient", 1613, 0, 0.0, 434.48047117172956, 313, 2146, 379.0, 578.6000000000001, 719.0, 1206.5799999999997, 0.45441611895391326, 10.474496064796554, 0.3162885984305318], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 1627, 0, 0.0, 449.4990780577749, 330, 1865, 395.0, 591.0, 761.5999999999999, 1172.080000000001, 0.45565563300425493, 11.844159992924315, 0.3605860704294617], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 398, 0, 0.0, 2408.7914572864333, 1032, 4455, 2280.0, 3131.9000000000005, 3387.6499999999987, 4040.0699999999997, 0.11379748793475002, 5.14977303226845, 0.6858904347850329], "isController": true}, {"data": ["4.0 Vaccination for hpv", 396, 0, 0.0, 2371.6111111111136, 1121, 4112, 2279.5, 2977.0, 3235.15, 3745.5499999999947, 0.11321395550691549, 4.879269538412981, 0.6844032985750765], "isController": true}, {"data": ["1.2 Sign-in page", 1638, 0, 0.0, 566.979853479853, 90, 3303, 503.0, 821.1000000000001, 946.0999999999999, 1414.1499999999985, 0.45594456515748455, 8.584062613255462, 0.6023831910837786], "isController": false}, {"data": ["Debug Sampler", 1636, 0, 0.0, 0.4951100244498777, 0, 10, 0.0, 1.0, 1.0, 1.0, 0.45659870248938395, 2.8338531324178104, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 957, 11, 1.1494252873563218, 869.6792058516193, 150, 3571, 775.0, 1191.0, 1347.7999999999993, 2203.7199999999975, 0.26887755001698393, 6.972047760235258, 0.3980980096072449], "isController": false}, {"data": ["1.4 Open Sessions list", 1636, 0, 0.0, 661.9119804400979, 462, 1855, 587.0, 891.0, 992.0, 1406.8199999999983, 0.4565249300004409, 10.237482390234497, 0.2954627001203261], "isController": false}, {"data": ["4.2 Vaccination batch", 1579, 0, 0.0, 552.255224825838, 414, 2138, 492.0, 739.0, 879.0, 1273.4, 0.45092834408774113, 6.375980247967752, 0.729962456252954], "isController": false}, {"data": ["1.1 Homepage", 1638, 0, 0.0, 554.448717948718, 267, 2575, 495.5, 755.0, 894.0999999999999, 1384.6599999999994, 0.45607570522585356, 8.388861582972506, 0.5979655439572893], "isController": false}, {"data": ["1.3 Sign-in", 1636, 0, 0.0, 673.5000000000002, 410, 2673, 628.5, 916.3, 1146.2999999999997, 1699.9299999999987, 0.4564235476608293, 8.758417466953931, 0.7683972312060072], "isController": false}, {"data": ["2.2 Session register", 1628, 0, 0.0, 457.3108108108106, 324, 2441, 404.0, 632.0, 718.2999999999997, 1051.9700000000003, 0.455453920820399, 12.879009049733721, 0.30366017147084756], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 396, 0, 0.0, 2397.613636363637, 1181, 4865, 2235.0, 2992.6, 3483.399999999999, 3965.4999999999986, 0.11400689914477552, 5.460903872373163, 0.6898662324448088], "isController": true}, {"data": ["2.1 Open session", 1634, 0, 0.0, 951.217870257038, 509, 3720, 874.5, 1395.0, 1641.25, 2183.65, 0.45612733377941134, 7.519945855204555, 0.30010394500595], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, 100.0, 0.05399568034557235], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20372, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 957, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
