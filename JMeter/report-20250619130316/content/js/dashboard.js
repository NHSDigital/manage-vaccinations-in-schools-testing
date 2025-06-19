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

    var data = {"OkPercent": 92.42685025817556, "KoPercent": 7.573149741824441};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3955172413793103, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.46923076923076923, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.2815126050420168, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.5869565217391305, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.030303030303030304, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8867924528301887, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.5681818181818182, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.030303030303030304, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5493827160493827, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.5692307692307692, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.32142857142857145, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.04477611940298507, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1162, 88, 7.573149741824441, 3166.3717728055003, 0, 32656, 552.0, 10462.0, 15875.199999999968, 28099.18999999997, 3.572263007095338, 128.20516792633515, 3.5079622249326743], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 65, 0, 0.0, 1170.9538461538457, 932, 1538, 1074.0, 1458.6, 1508.4, 1538.0, 0.7092353351955307, 13.873126919709104, 1.6500164010671265], "isController": false}, {"data": ["Prevent multiple runs", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["4.1 Vaccination questions", 119, 54, 45.378151260504204, 492.3781512605044, 136, 1816, 505.0, 804.0, 837.0, 1762.5999999999992, 0.7430580272121586, 6.218470523933961, 1.3256209842084559], "isController": false}, {"data": ["2.0 Register attendance", 99, 33, 33.333333333333336, 24670.575757575753, 0, 69933, 26786.0, 52869.0, 58213.0, 69933.0, 0.790450716595473, 185.44016228192743, 2.3837185366681304], "isController": true}, {"data": ["1.0 Login", 70, 1, 1.4285714285714286, 14765.257142857143, 1885, 49845, 8230.0, 45221.399999999994, 48196.05000000001, 49845.0, 0.6598731158265854, 124.0660144135142, 3.133357042613663], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 451.0, 451, 451, 451.0, 451.0, 451.0, 451.0, 2.2172949002217295, 33.978312084257205, 1.3468334257206207], "isController": false}, {"data": ["1.4 Select Organisations", 69, 0, 0.0, 4253.478260869566, 461, 27993, 498.0, 18756.0, 23550.0, 27993.0, 0.738742211087557, 10.614369288800026, 1.0677133519624846], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 338.0, 338, 338, 338.0, 338.0, 338.0, 338.0, 2.9585798816568047, 34.06700721153846, 1.7971061390532543], "isController": false}, {"data": ["2.3 Search by first/last name", 66, 0, 0.0, 7086.424242424241, 1137, 18948, 5317.0, 15055.4, 15804.8, 18948.0, 0.7057087561348545, 71.09689929215274, 0.6084942006244454], "isController": false}, {"data": ["5.9 Patient return to menacwy vaccination page", 53, 0, 0.0, 475.377358490566, 357, 961, 403.0, 795.4000000000001, 854.5999999999997, 961.0, 0.577103159912019, 15.79925172246238, 0.4023941954855289], "isController": false}, {"data": ["4.0 Vaccination", 119, 54, 45.378151260504204, 1456.6050420168062, 136, 3792, 2296.0, 2549.0, 2622.0, 3740.1999999999994, 0.6479752135867879, 19.040520018826676, 2.5341682281825655], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 147.18571428571425, 138, 331, 143.0, 150.0, 170.2000000000001, 331.0, 1.1627713825351738, 7.007287306273982, 0.7006151787345725], "isController": false}, {"data": ["2.5 Patient return to consent page", 66, 0, 0.0, 1459.7727272727263, 353, 9663, 850.5, 3569.6000000000004, 6442.349999999999, 9663.0, 0.764455151964418, 15.608508291732303, 0.530042146381579], "isController": false}, {"data": ["Debug Sampler", 131, 0, 0.0, 0.29770992366412213, 0, 3, 0.0, 1.0, 1.0, 2.3600000000000136, 0.6256776184130715, 1.7549841147736338, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 66, 0, 0.0, 7978.606060606062, 1354, 27893, 4941.5, 20820.5, 23042.949999999997, 27893.0, 0.7007410867857219, 60.35582600519185, 1.041531185632684], "isController": false}, {"data": ["1.5 Open Sessions list", 81, 0, 0.0, 3819.8518518518526, 317, 23216, 546.0, 12349.599999999999, 20893.69999999999, 23216.0, 0.30312783012866096, 3.2950350362911376, 0.1834905730987149], "isController": false}, {"data": ["4.2 Vaccination batch", 65, 0, 0.0, 593.8769230769233, 483, 889, 525.0, 792.2, 817.1999999999999, 889.0, 0.7411292529417131, 14.018132457613108, 1.161633252901806], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 448.1857142857143, 400, 1899, 424.0, 441.9, 461.30000000000007, 1899.0, 1.1803986374827156, 6.092194139742336, 0.6397668396512766], "isController": false}, {"data": ["1.3 Sign-in", 70, 1, 1.4285714285714286, 5530.771428571428, 516, 31698, 784.0, 22238.899999999998, 30393.700000000004, 31698.0, 0.7982575178752666, 7.64327118803526, 1.248324193759907], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 5841.0, 5841, 5841, 5841.0, 5841.0, 5841.0, 5841.0, 0.1712035610340695, 1701.6587351266905, 0.10716941662386577], "isController": false}, {"data": ["2.2 Session register", 67, 1, 1.492537313432836, 8695.656716417912, 859, 32603, 7599.0, 18415.40000000001, 27872.799999999996, 32603.0, 0.6669121965300658, 81.53107557322099, 0.4109585898539761], "isController": false}, {"data": ["2.1 Open session", 99, 32, 32.323232323232325, 7768.707070707074, 0, 32656, 5773.0, 19427.0, 23216.0, 32656.0, 0.7724899927432758, 9.551638810209353, 0.440827400668711], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 60.0, 60, 60, 60.0, 60.0, 60.0, 60.0, 16.666666666666668, 0.11393229166666667, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 6, 6.818181818181818, 0.5163511187607573], "isController": false}, {"data": ["502/Bad Gateway", 4, 4.545454545454546, 0.3442340791738382], "isController": false}, {"data": ["422/Unprocessable Entity", 54, 61.36363636363637, 4.647160068846816], "isController": false}, {"data": ["404/Not Found", 24, 27.272727272727273, 2.0654044750430294], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1162, 88, "422/Unprocessable Entity", 54, "404/Not Found", 24, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 6, "502/Bad Gateway", 4, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 119, 54, "422/Unprocessable Entity", 54, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 70, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 67, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.1 Open session", 99, 32, "404/Not Found", 24, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 6, "502/Bad Gateway", 2, "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
