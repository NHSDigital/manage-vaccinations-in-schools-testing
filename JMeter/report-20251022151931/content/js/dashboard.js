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

    var data = {"OkPercent": 99.92779783393502, "KoPercent": 0.07220216606498195};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.40342931730084647, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.11762688614540466, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.0804054054054054, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7892287234042553, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7338390501319261, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3893979057591623, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.37124463519313305, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.27150361129349965, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4684959349593496, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.47513089005235604, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3524590163934426, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6577733860342556, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.12081418253447143, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20775, 15, 0.07220216606498195, 1089.001251504209, 0, 15146, 938.0, 2026.0, 2544.0, 4959.910000000014, 5.768625231786277, 1969.1083318055616, 20.75756119428452], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1458, 0, 0.0, 2019.4314128943738, 1165, 15146, 1749.5, 2849.1000000000004, 3483.299999999999, 7203.520000000022, 0.4221768515625611, 166.49766617123746, 2.189821289505604], "isController": false}, {"data": ["4.1 Vaccination questions", 1480, 0, 0.0, 1713.204729729728, 872, 8914, 1557.0, 2005.7000000000003, 2408.8, 4974.920000000015, 0.4206927388149029, 162.3867662211694, 2.091120112982294], "isController": false}, {"data": ["Get Next Patient from STS", 1523, 0, 0.0, 0.606697307944845, 0, 7, 1.0, 1.0, 1.0, 1.0, 0.4252678936422589, 0.17908866860015102, 0.27147875330678595], "isController": false}, {"data": ["2.0 Register attendance", 1508, 15, 0.9946949602122016, 5428.234748010613, 2293, 22119, 4859.5, 7703.100000000001, 9826.949999999997, 15721.970000000038, 0.42321675040258916, 805.5260737204359, 7.782769979240489], "isController": true}, {"data": ["1.0 Login", 1523, 0, 0.0, 4771.072225870006, 2960, 18158, 4505.0, 5629.6, 6362.4, 10833.199999999999, 0.42500918109130525, 692.42983283603, 7.0648570629312175], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 360, 0, 0.0, 4743.669444444439, 2407, 13313, 4427.5, 5759.9, 6990.949999999998, 10901.97999999995, 0.10364042759737306, 121.55353434955053, 1.5118761044183067], "isController": true}, {"data": ["2.5 Select patient", 1504, 0, 0.0, 569.2446808510643, 382, 7219, 461.0, 792.0, 1044.5, 2149.7500000000027, 0.42260949561950084, 167.4263425710435, 1.5021157212769551], "isController": false}, {"data": ["2.3 Search by first/last name", 1516, 0, 0.0, 584.3073878627964, 386, 6883, 510.5, 784.3, 932.1499999999999, 1877.1699999999928, 0.42441851024623556, 168.64278297110314, 1.5693798938659766], "isController": false}, {"data": ["4.0 Vaccination for flu", 376, 0, 0.0, 4820.204787234041, 2495, 18399, 4379.5, 6115.500000000001, 7014.849999999999, 10921.730000000001, 0.10725420673248348, 124.5538943251899, 1.561494380385887], "isController": true}, {"data": ["4.0 Vaccination for hpv", 388, 0, 0.0, 4778.695876288664, 2142, 14872, 4445.5, 5866.5, 7278.149999999999, 12418.140000000014, 0.11108760202236698, 128.9675778428298, 1.6171215752880475], "isController": true}, {"data": ["1.2 Sign-in page", 1528, 0, 0.0, 1013.1806282722523, 266, 6098, 790.0, 1634.0, 1777.1999999999998, 3113.600000000002, 0.42505735353394297, 166.62663978418254, 1.8153074596591918], "isController": false}, {"data": ["Debug Sampler", 1508, 0, 0.0, 0.48408488063660504, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.42310465667638386, 2.638522475155227, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1165, 15, 1.2875536480686696, 1391.2918454935618, 612, 12220, 1194.0, 2018.0, 2424.4, 3752.1999999999975, 0.3552071848809187, 140.6544885444349, 1.552487585566057], "isController": false}, {"data": ["1.4 Open Sessions list", 1523, 0, 0.0, 1615.2317793827997, 848, 10058, 1427.0, 2286.6000000000004, 2495.3999999999996, 3449.3999999999987, 0.4251242574282299, 191.35665809433934, 1.5105877211141605], "isController": false}, {"data": ["4.2 Vaccination batch", 1476, 0, 0.0, 1110.960027100273, 591, 8152, 1024.0, 1338.4999999999998, 1635.6499999999985, 3205.260000000001, 0.42079910776904633, 164.07245713928737, 1.8839334059397106], "isController": false}, {"data": ["1.1 Homepage", 1528, 0, 0.0, 967.0981675392668, 594, 11776, 851.0, 1245.1000000000001, 1507.2499999999993, 2782.620000000001, 0.42516864837551077, 167.4011026059701, 1.8076297773040078], "isController": false}, {"data": ["1.3 Sign-in", 1525, 0, 0.0, 1175.0977049180335, 515, 11815, 1013.0, 1684.0, 1843.4, 3298.1000000000013, 0.42460480429894965, 167.05242069330657, 1.9308903475494734], "isController": false}, {"data": ["2.2 Session register", 1518, 0, 0.0, 633.7292490118575, 380, 8334, 555.0, 855.2000000000003, 1023.3499999999997, 1806.2899999999995, 0.4245973318057526, 172.23335806989815, 1.5159915971754487], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 352, 0, 0.0, 4941.153409090911, 2385, 17761, 4464.0, 6232.5, 7738.249999999996, 13819.82, 0.10145103805739708, 118.42434517380912, 1.4795569763584495], "isController": true}, {"data": ["2.1 Open session", 1523, 0, 0.0, 2560.734077478658, 811, 14727, 2036.0, 4258.8, 5767.799999999999, 10782.39999999999, 0.42518193766827206, 167.0156574692399, 1.5143485992167496], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, 100.0, 0.07220216606498195], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20775, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1165, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
