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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8507538786510307, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9444444444444444, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.8972718086897945, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.5925925925925926, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.31741115096185196, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.7678571428571429, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.7592592592592593, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.9915796564499831, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5925925925925926, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9005542875774373, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8752879236590984, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8930551027062276, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8940332572546462, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.9910744358369822, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9385314920848771, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8703703703703703, 500, 1500, "7.3 Due vaccination"], "isController": false}, {"data": [0.7222222222222222, 500, 1500, "7.7 Partial name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21395, 0, 0.0, 276.8671652255213, 2, 25423, 168.0, 684.0, 1006.0, 1903.9900000000016, 5.740612843625116, 2389.0444377990207, 44.66967953463136], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 220.99999999999997, 83, 1173, 119.0, 625.3999999999999, 1042.5999999999992, 1173.0, 0.007866740905391951, 3.253747830545885, 0.05804822816593346], "isController": false}, {"data": ["2.0 Register attendance", 2969, 0, 0.0, 363.1704277534518, 111, 4388, 217.0, 804.0, 1104.0, 1907.1000000000067, 1.6481790092273598, 1979.3639141321426, 35.62668199852946], "isController": true}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1135.4074074074076, 183, 5720, 678.0, 2921.1999999999985, 5355.999999999998, 5720.0, 0.00787783634932894, 3.584127471361147, 0.057914406286863535], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3067, 0, 0.0, 1482.5865666775314, 516, 14947, 1213.0, 2647.4000000000005, 3211.7999999999984, 4537.80000000001, 0.8598608971037799, 1464.807997663068, 28.17902774311256], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 733.892857142857, 184, 4997, 279.5, 2095.800000000004, 4731.499999999998, 4997.0, 0.00785259996780434, 3.609145543698597, 0.056203658705111875], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 594.962962962963, 196, 2332, 429.0, 1393.1999999999996, 2151.999999999999, 2332.0, 0.007856302980943227, 3.2998242802353457, 0.05784305365331182], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1824.0740740740746, 1530, 2875, 1686.0, 2465.7999999999997, 2758.9999999999995, 2875.0, 0.007863434853189672, 3.9537824272945357, 0.05821581138706913], "isController": false}, {"data": ["2.3 Search by first/last name", 2969, 0, 0.0, 51.48905355338486, 11, 3225, 20.0, 77.0, 177.5, 642.2000000000025, 1.647280101422298, 650.2580815908889, 12.060802209007331], "isController": false}, {"data": ["7.6 First name search", 27, 0, 0.0, 1251.6296296296293, 182, 4813, 295.0, 4017.9999999999995, 4784.599999999999, 4813.0, 0.007868797420433343, 3.6312951836548177, 0.05783116425925181], "isController": false}, {"data": ["1.2 Sign-in page", 3067, 0, 0.0, 344.83012716009125, 13, 5835, 195.0, 776.2000000000003, 1094.7999999999997, 2043.6800000000203, 0.8598042494570506, 354.4074912753663, 7.289339767684648], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 3654.1111111111113, 1967, 25423, 2171.0, 7278.399999999999, 18664.999999999964, 25423.0, 0.007854193586672772, 4.0033081517947995, 0.05809370422023275], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 9.796142578125, 18.4326171875], "isController": false}, {"data": ["1.4 Open Sessions list", 3039, 0, 0.0, 419.5416255347145, 175, 3974, 309.0, 812.0, 1060.0, 1857.5999999999967, 1.663352550282343, 781.7533113283943, 11.906256769000615], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["1.1 Homepage", 3067, 0, 0.0, 361.75774372350804, 28, 4956, 208.0, 803.2000000000003, 1166.3999999999996, 1969.0, 0.8599628816803793, 355.0284860513993, 7.279028097716963], "isController": false}, {"data": ["1.3 Sign-in", 3067, 0, 0.0, 360.28725138571946, 97, 5652, 200.0, 827.0000000000014, 1151.6, 2060.9200000000174, 0.8601401464734254, 355.07241965011127, 7.514799587451041], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 10377.37037037037, 4858, 30356, 8912.0, 19251.399999999998, 27553.199999999986, 30356.0, 0.007825676392050156, 29.169192047460697, 0.4613718544766202], "isController": true}, {"data": ["2.2 Session register", 2969, 0, 0.0, 51.92792185921193, 10, 2498, 19.0, 74.0, 180.0, 740.5000000000027, 1.6474510286997177, 651.7821552241232, 11.741306257275918], "isController": false}, {"data": ["2.1 Open session", 2969, 0, 0.0, 258.8659481306837, 82, 3777, 147.0, 563.0, 907.5, 1523.100000000003, 1.6486988661794055, 676.8942590423692, 11.81652967508721], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 498.03703703703707, 327, 1367, 396.0, 891.8, 1178.199999999999, 1367.0, 0.007866064805885914, 3.963075546942781, 0.05793569541184093], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1198.148148148148, 183, 9930, 301.0, 4988.2, 8097.59999999999, 9930.0, 0.007885087984440093, 3.6347657476341086, 0.057943190313899516], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21395, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
