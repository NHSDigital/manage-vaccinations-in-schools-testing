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

    var data = {"OkPercent": 99.9259003112187, "KoPercent": 0.07409968878130711};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6449759807846277, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3408203125, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8729955099422707, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.05720606826801517, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.18574108818011256, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.1810810810810811, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9189360354654845, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9319899244332494, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.18227848101265823, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.17639902676399027, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8739862757330006, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.3818108974358974, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.49059561128526646, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8695372750642674, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9075342465753424, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8711694809255784, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.1763157894736842, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4670226130653266, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20243, 15, 0.07409968878130711, 580.1314528478933, 0, 9663, 246.0, 1435.0, 2029.9000000000015, 3836.980000000003, 5.045105128994987, 1931.096350149826, 37.9942559840684], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1536, 0, 0.0, 1526.5214843749982, 580, 9663, 1107.0, 2849.2, 4126.099999999988, 6980.2999999999865, 0.4457618668135514, 181.60606852471395, 4.54276201197274], "isController": false}, {"data": ["4.1 Vaccination questions", 1559, 0, 0.0, 418.20012828736395, 89, 6391, 181.0, 1018.0, 1517.0, 3701.600000000002, 0.44610703650151357, 178.45032937772217, 4.1382817375718846], "isController": false}, {"data": ["2.0 Register attendance", 1582, 15, 0.9481668773704172, 3060.065107458912, 569, 15050, 2648.0, 5089.4, 6328.4, 9160.030000000004, 0.44287735908479475, 884.8969183131678, 15.775880908122545], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1599, 0, 0.0, 2037.715447154473, 300, 11278, 1747.0, 3385.0, 4271.0, 5951.0, 0.44520560340951204, 752.7112708995527, 14.49785171634208], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 370, 0, 0.0, 2363.4810810810823, 354, 11139, 1746.0, 4610.6, 6345.299999999999, 8686.470000000007, 0.10685183029965585, 128.85762491547516, 3.0031986149548087], "isController": true}, {"data": ["2.5 Select patient", 1579, 0, 0.0, 296.5592146928432, 76, 5054, 129.0, 636.0, 1184.0, 2538.4000000000124, 0.4464130471351676, 183.7069584642557, 3.1822998198656913], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["2.3 Search by first/last name", 1588, 0, 0.0, 260.4760705289675, 84, 4051, 132.0, 549.1000000000001, 905.0999999999999, 2042.989999999999, 0.44519228774448427, 184.92410456434584, 3.2921667866788824], "isController": false}, {"data": ["4.0 Vaccination for flu", 395, 0, 0.0, 2296.260759493668, 208, 10500, 1845.0, 4375.200000000002, 5627.199999999999, 8076.560000000017, 0.1132323300948887, 136.07507537743632, 3.1741767270546153], "isController": true}, {"data": ["4.0 Vaccination for hpv", 411, 0, 0.0, 2300.8467153284687, 197, 9654, 1904.0, 3797.6000000000013, 5069.599999999994, 8604.64, 0.11809621997274306, 141.54872528410976, 3.3199569183157753], "isController": true}, {"data": ["1.2 Sign-in page", 1603, 0, 0.0, 380.01310043668116, 15, 4600, 166.0, 959.4000000000005, 1500.7999999999993, 2773.040000000001, 0.44583432763010267, 182.06586178343187, 3.7343657805918], "isController": false}, {"data": ["Debug Sampler", 1588, 0, 0.0, 0.2877833753148609, 0, 15, 0.0, 1.0, 1.0, 1.0, 0.44523285425941767, 2.5580071947477383, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1248, 15, 1.2019230769230769, 1237.2508012820506, 196, 8081, 874.5, 2327.8000000000025, 3276.449999999999, 5806.1, 0.3513309757373306, 146.74620778345204, 3.0427114560993926], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 16.49876644736842, 31.044407894736842], "isController": false}, {"data": ["1.4 Open Sessions list", 1595, 0, 0.0, 942.0300940438874, 446, 4887, 787.0, 1519.4, 1883.1999999999998, 3127.08, 0.4448025174428122, 208.21348845638119, 3.1703794539337973], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1556, 0, 0.0, 402.48521850899704, 93, 6765, 187.0, 994.8999999999999, 1503.7499999999993, 2796.970000000005, 0.44579507236004656, 179.0154687071592, 3.907940465980478], "isController": false}, {"data": ["1.1 Homepage", 1606, 0, 0.0, 323.6438356164383, 29, 5351, 164.0, 698.0, 1101.9499999999996, 2612.4100000000026, 0.4461450677079311, 181.71364406667686, 3.7288425628610344], "isController": false}, {"data": ["1.3 Sign-in", 1599, 0, 0.0, 393.20637898686647, 84, 6180, 182.0, 966.0, 1458.0, 2523.0, 0.4453923617020506, 181.36546401792378, 3.8847721658951455], "isController": false}, {"data": ["2.2 Session register", 1590, 0, 0.0, 333.7352201257862, 80, 6418, 137.0, 811.0, 1249.0499999999984, 2604.9399999999946, 0.4453236396553139, 189.70475599564213, 3.181411216697704], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 380, 0, 0.0, 2356.521052631578, 220, 11358, 1885.0, 4358.700000000002, 5560.199999999997, 8919.449999999999, 0.10995898529848366, 133.0314326010921, 3.096658037629267], "isController": true}, {"data": ["2.1 Open session", 1592, 0, 0.0, 1195.4956030150743, 144, 8599, 939.5, 2349.8, 3042.349999999998, 4595.659999999998, 0.44461772371365277, 181.66877989326312, 3.172463350020695], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, 100.0, 0.07409968878130711], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20243, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1248, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
