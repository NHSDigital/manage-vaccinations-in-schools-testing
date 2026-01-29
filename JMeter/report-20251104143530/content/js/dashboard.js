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

    var data = {"OkPercent": 99.92791793734405, "KoPercent": 0.07208206265594677};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3561837455830389, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.07525083612040134, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.008569545154911009, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.856629653821032, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7840466926070039, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.39884763124199746, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3390909090909091, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.2598070739549839, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4907529722589168, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.49360204734484964, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3619139370584457, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6974789915966386, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5547680412371134, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18035, 13, 0.07208206265594677, 1044.7673967285787, 308, 5128, 862.0, 1787.0, 2133.2000000000007, 2716.279999999999, 5.008091810110709, 2045.8375756949752, 21.096234217290927], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1495, 0, 0.0, 1914.1846153846166, 1254, 5128, 1785.0, 2523.6000000000004, 2922.4, 3565.3999999999987, 0.43299346483977214, 174.88991696653395, 2.275569764279951], "isController": false}, {"data": ["4.1 Vaccination questions", 1517, 0, 0.0, 1621.6367831245875, 521, 3478, 1575.0, 1749.0, 1878.1999999999998, 2393.64, 0.433798663659911, 171.23466100963208, 2.1889349965785097], "isController": false}, {"data": ["2.0 Register attendance", 1534, 13, 0.847457627118644, 3339.9426336375477, 1551, 7193, 3391.5, 4431.0, 4813.0, 5567.750000000002, 0.4308302582144923, 827.8623840954439, 7.654539839616836], "isController": true}, {"data": ["1.0 Login", 1557, 0, 0.0, 4477.3622350674295, 1938, 6557, 4457.0, 5076.0, 5343.9, 5908.52, 0.43361040397618233, 722.6624393525044, 7.280666328665686], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 378, 0, 0.0, 4414.822751322756, 2195, 7691, 4269.5, 5224.5, 5475.150000000001, 6801.739999999998, 0.10848159629807988, 129.10297098501147, 1.601600705324093], "isController": true}, {"data": ["2.5 Select patient", 1531, 0, 0.0, 460.16067929457785, 344, 1683, 397.0, 628.0, 720.9999999999986, 1120.520000000001, 0.43220567456973513, 175.77307093635622, 1.55735486501336], "isController": false}, {"data": ["2.3 Search by first/last name", 1542, 0, 0.0, 498.37613488975364, 341, 2863, 450.0, 702.8000000000002, 813.0, 1128.2699999999993, 0.4321534497868239, 175.95891370526883, 1.628017251088581], "isController": false}, {"data": ["4.0 Vaccination for flu", 380, 0, 0.0, 4399.6263157894755, 2281, 6566, 4328.0, 5050.900000000001, 5306.7, 6059.33, 0.10898951234076776, 129.66224850356323, 1.6072401500011186], "isController": true}, {"data": ["4.0 Vaccination for hpv", 377, 0, 0.0, 4460.437665782493, 2429, 6542, 4337.0, 5188.4, 5663.4, 6227.319999999998, 0.10828370330265295, 128.94105635761053, 1.6038937321651427], "isController": true}, {"data": ["1.2 Sign-in page", 1562, 0, 0.0, 949.0249679897566, 308, 2583, 739.5, 1726.7, 1792.85, 2005.5799999999963, 0.43458361909107474, 174.899799127668, 1.8816324016761519], "isController": false}, {"data": ["2.4 Patient attending session", 1100, 13, 1.1818181818181819, 1473.927272727272, 369, 4684, 1327.5, 2095.7, 2386.75, 3103.96, 0.3094663505983673, 126.26772379507518, 1.370901865477228], "isController": false}, {"data": ["1.4 Open Sessions list", 1555, 0, 0.0, 1659.636655948555, 908, 3718, 1478.0, 2415.0, 2515.5999999999995, 2901.8400000000006, 0.4338831791164632, 199.54304356127824, 1.5629176103800202], "isController": false}, {"data": ["4.2 Vaccination batch", 1514, 0, 0.0, 919.4801849405538, 502, 2227, 947.0, 1079.5, 1230.25, 1733.6499999999992, 0.43371755819879443, 172.3443949856707, 1.9672096527366174], "isController": false}, {"data": ["1.1 Homepage", 1563, 0, 0.0, 761.2149712092128, 500, 2790, 690.0, 1020.8000000000004, 1332.8, 1569.4399999999996, 0.4344013640703102, 174.63927478048905, 1.872634464141043], "isController": false}, {"data": ["1.3 Sign-in", 1557, 0, 0.0, 1109.5144508670512, 489, 3119, 968.0, 1747.4, 1832.2999999999997, 2188.620000000001, 0.4339117801892658, 174.79425506516063, 1.975595571438405], "isController": false}, {"data": ["2.2 Session register", 1547, 0, 0.0, 565.2766645119584, 340, 3219, 518.0, 811.0, 887.5999999999999, 1228.6799999999998, 0.43301639444294693, 180.4839679296883, 1.5672333286763778], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 379, 0, 0.0, 4451.073878627962, 2375, 7263, 4376.0, 5142.0, 5654.0, 6247.599999999999, 0.11003348618020059, 131.2929199094851, 1.6243449001983217], "isController": true}, {"data": ["2.1 Open session", 1552, 0, 0.0, 759.8891752577318, 356, 2633, 715.0, 1089.7, 1356.4999999999973, 1800.860000000001, 0.433774122746338, 173.1979932239039, 1.5661698824505668], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, 100.0, 0.07208206265594677], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18035, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1100, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
