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

    var data = {"OkPercent": 99.98963730569949, "KoPercent": 0.010362694300518135};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.44738140261448656, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.03787878787878788, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4541003671970624, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0017772511848341231, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [5.820721769499418E-4, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9257719714964371, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8714454976303317, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6771196283391405, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.2616707616707617, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.34912280701754383, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5141625615763546, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6479118329466357, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5692665890570431, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7877358490566038, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.47297297297297297, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9650, 1, 0.010362694300518135, 925.6680829015537, 227, 4786, 745.0, 1720.0, 2018.0, 2871.9799999999996, 5.3595627929709195, 2191.924322448341, 25.51740912000422], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 792, 0, 0.0, 2062.438131313133, 1302, 4786, 1889.0, 2836.1000000000004, 3240.7, 3888.4299999999967, 0.4745999158663785, 191.70382238229234, 2.8316095566266015], "isController": false}, {"data": ["4.1 Vaccination questions", 817, 0, 0.0, 1261.8555691554466, 449, 2616, 1191.0, 1462.6000000000001, 1714.299999999998, 2193.0399999999986, 0.47535430477832896, 187.64850674219824, 2.6873738976522032], "isController": false}, {"data": ["2.0 Register attendance", 844, 1, 0.11848341232227488, 3094.7120853080555, 1365, 7509, 3053.0, 4436.0, 4873.75, 5964.9, 0.47627135955722566, 872.1675813981753, 9.072942507021335], "isController": true}, {"data": ["1.0 Login", 859, 0, 0.0, 3536.9650756693827, 1435, 7509, 3463.0, 4222.0, 4564.0, 5169.8, 0.47931282499390393, 797.5368031227803, 9.081921886273129], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 207, 0, 0.0, 3975.4396135265692, 1917, 6493, 3869.0, 4819.200000000001, 5124.4, 6069.039999999994, 0.12151645491299246, 144.20096828930514, 2.0207470772577554], "isController": true}, {"data": ["2.5 Select patient", 842, 0, 0.0, 399.0344418052259, 272, 1723, 329.0, 570.0000000000005, 773.6499999999992, 1270.2499999999984, 0.47965073223640287, 195.05459749873108, 1.9718930661203091], "isController": false}, {"data": ["2.3 Search by first/last name", 844, 0, 0.0, 431.4644549763031, 270, 1613, 374.5, 634.0, 754.75, 1186.6999999999994, 0.4768062567827667, 193.95573811296296, 2.0382604625500886], "isController": false}, {"data": ["4.0 Vaccination for flu", 199, 0, 0.0, 4043.4221105527636, 1714, 6119, 3927.0, 4989.0, 5351.0, 6057.0, 0.11642349367598114, 138.41785049596263, 1.9385897745435643], "isController": true}, {"data": ["4.0 Vaccination for hpv", 200, 0, 0.0, 4033.0799999999986, 1658, 6671, 3903.5, 5018.5, 5204.45, 6406.170000000001, 0.11734258931677864, 138.57373236267543, 1.9462173717929536], "isController": true}, {"data": ["1.2 Sign-in page", 861, 0, 0.0, 726.131242740999, 227, 2768, 552.0, 1311.6000000000001, 1411.9999999999998, 2038.4199999999996, 0.48013624493305695, 193.00259747487232, 2.3316072904102128], "isController": false}, {"data": ["2.4 Patient attending session", 407, 1, 0.2457002457002457, 1676.1891891891894, 808, 4724, 1458.0, 2485.7999999999997, 2863.7999999999993, 3906.4800000000005, 0.25752957635435564, 105.05231284556103, 1.2994470776325122], "isController": false}, {"data": ["1.4 Open Sessions list", 855, 0, 0.0, 1265.8023391812842, 691, 2740, 1129.0, 1816.0, 1945.1999999999998, 2431.1199999999985, 0.479158026877683, 220.3410994163589, 1.9684133765999954], "isController": false}, {"data": ["4.2 Vaccination batch", 812, 0, 0.0, 749.4470443349753, 397, 1878, 731.5, 1001.8000000000002, 1153.6999999999998, 1591.87, 0.47409248072977545, 188.39651013088047, 2.438257181377157], "isController": false}, {"data": ["1.1 Homepage", 862, 0, 0.0, 650.3352668213455, 386, 2106, 565.0, 996.7, 1083.6499999999992, 1673.9500000000003, 0.47932081019674394, 192.4685456795999, 2.3143131008191826], "isController": false}, {"data": ["1.3 Sign-in", 859, 0, 0.0, 899.0721769499424, 390, 2797, 793.0, 1354.0, 1503.0, 2098.7999999999997, 0.48011303615882744, 193.33789584523367, 2.484660940429095], "isController": false}, {"data": ["2.2 Session register", 848, 0, 0.0, 501.67452830188665, 269, 2718, 453.0, 694.8000000000002, 933.4499999999982, 1378.3599999999997, 0.4776216245443445, 200.09518627507373, 1.9699851392720438], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 204, 0, 0.0, 4064.0098039215723, 1947, 6910, 3872.5, 5153.0, 5471.75, 6334.599999999996, 0.12000670625711438, 143.0202475928802, 1.9985813545462836], "isController": true}, {"data": ["2.1 Open session", 851, 0, 0.0, 953.7426556991771, 416, 3319, 857.0, 1484.0000000000005, 1734.7999999999997, 2376.76, 0.47817316498940826, 192.82536071503324, 1.9680695575844669], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 100.0, 0.010362694300518135], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9650, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 407, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
