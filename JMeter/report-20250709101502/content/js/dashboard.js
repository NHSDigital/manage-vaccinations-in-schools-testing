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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7243804420629605, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9384615384615385, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9571428571428572, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9807692307692307, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.7887323943661971, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9565217391304348, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.40425531914893614, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.35555555555555557, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4626865671641791, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7571428571428571, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.13043478260869565, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.3082191780821918, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4888888888888889, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9607142857142857, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.34285714285714286, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.45652173913043476, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.9574468085106383, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9824561403508771, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.9459459459459459, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9746376811594203, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.5833333333333334, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1246, 0, 0.0, 513.9093097913322, 0, 6358, 334.0, 991.2999999999995, 1516.5999999999995, 3851.8499999999985, 2.0681356072866093, 47.72464300904602, 2.347090711751525], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 69, 0, 0.0, 4551.753623188405, 2034, 9059, 3819.0, 8088.0, 8757.5, 9059.0, 0.13227006095924548, 30.083007250891388, 0.5625034445328375], "isController": true}, {"data": ["2.5 Select patient", 65, 0, 0.0, 327.96923076923065, 160, 3075, 222.0, 507.1999999999998, 876.8999999999995, 3075.0, 0.12882868955456986, 3.5816098315366687, 0.08932457967162558], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 266.1714285714285, 206, 911, 225.0, 442.39999999999986, 594.9999999999983, 911.0, 0.4986394267071277, 7.164533090958955, 0.7206897964126455], "isController": false}, {"data": ["2.5 Select menacwy", 26, 0, 0.0, 291.2307692307692, 163, 518, 257.5, 468.3, 500.8499999999999, 518.0, 0.08875567951006866, 2.2460314103362813, 0.06188628434588771], "isController": false}, {"data": ["2.3 Search by first/last name", 71, 0, 0.0, 777.1126760563383, 315, 6358, 435.0, 1154.9999999999998, 3519.2, 6358.0, 0.13549282174297203, 6.916000593019638, 0.11690877659523713], "isController": false}, {"data": ["2.5 Select td_ipv", 23, 0, 0.0, 288.21739130434776, 162, 559, 244.0, 494.6, 548.5999999999999, 559.0, 0.31840961320153943, 8.161409447074785, 0.22170513106708753], "isController": false}, {"data": ["4.0 Vaccination for flu", 47, 0, 0.0, 1482.617021276596, 1183, 4121, 1390.0, 1658.4000000000005, 2534.6, 4121.0, 0.1319768731589928, 7.212546538520399, 0.7957442021436414], "isController": true}, {"data": ["4.0 Vaccination for hpv", 45, 0, 0.0, 1472.911111111111, 577, 3700, 1405.0, 1854.6, 2269.2999999999997, 3700.0, 0.1378266875346481, 6.9718678741688285, 0.8205114633518837], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 91.2857142857143, 84, 124, 87.0, 103.79999999999998, 118.39999999999998, 124.0, 0.6034274680183441, 3.6364754933019547, 0.36358862086652183], "isController": false}, {"data": ["2.4 Patient attending session", 67, 0, 0.0, 847.3731343283579, 502, 5323, 629.0, 1259.2000000000003, 1789.399999999999, 5323.0, 0.13008622581027215, 6.079460537760925, 0.1933508160969084], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 300.0, 300, 300, 300.0, 300.0, 300.0, 300.0, 3.3333333333333335, 20.904947916666668, 7.047526041666667], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 265.3428571428571, 250, 324, 263.0, 280.0, 295.99999999999983, 324.0, 0.599602549167409, 3.0946283909665593, 0.3249798972538203], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 741.9142857142858, 432, 3376, 490.0, 1585.3999999999999, 2416.7999999999947, 3376.0, 0.4974841515763141, 4.827636732630697, 0.7826630548725019], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 23, 0, 0.0, 2128.260869565217, 1254, 4767, 1588.0, 4311.4000000000015, 4733.799999999999, 4767.0, 0.31330454564029914, 17.804775936167605, 1.9154784364740978], "isController": true}, {"data": ["2.1 Open session", 73, 0, 0.0, 1619.9315068493145, 738, 5953, 1209.0, 3329.4000000000005, 3841.5, 5953.0, 0.1328613418995532, 2.327703978560183, 0.08428249187816796], "isController": false}, {"data": ["4.3 Vaccination confirm", 135, 0, 0.0, 875.3111111111115, 491, 4069, 723.0, 1167.8000000000006, 2059.3999999999974, 4065.04, 0.333623297285542, 7.015313116276368, 0.7764488557029813], "isController": false}, {"data": ["4.1 Vaccination questions", 140, 0, 0.0, 396.0857142857143, 245, 1127, 423.5, 479.40000000000003, 557.6999999999999, 1004.8200000000011, 0.3090500903971515, 3.7169266389588547, 0.6638971961430549], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 1634.142857142857, 1122, 4869, 1213.0, 2797.7999999999997, 4282.599999999997, 4869.0, 0.562529130972854, 25.995547858170333, 2.6780561655201787], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 23, 0, 0.0, 1393.5652173913045, 1195, 1831, 1366.0, 1523.8, 1772.999999999999, 1831.0, 0.28192147873944323, 15.060941579434441, 1.723656812693821], "isController": true}, {"data": ["Calculate site depending on vaccination", 153, 0, 0.0, 0.3660130718954249, 0, 15, 0.0, 1.0, 1.0, 7.440000000000111, 0.3133101524776076, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 47, 0, 0.0, 322.14893617021283, 162, 1058, 244.0, 483.80000000000007, 521.9999999999999, 1058.0, 0.12797473179763655, 3.070688915039754, 0.09535617222812177], "isController": false}, {"data": ["2.5 Select flu", 57, 0, 0.0, 248.1929824561403, 158, 563, 218.0, 455.4000000000001, 483.1999999999997, 563.0, 0.11658873630082349, 2.773099287197943, 0.08083789333357878], "isController": false}, {"data": ["1.5 Open Sessions list", 37, 0, 0.0, 262.3243243243243, 121, 2713, 144.0, 452.00000000000034, 1484.5000000000018, 2713.0, 0.06602580002748101, 0.7231243626056637, 0.03964545372215987], "isController": false}, {"data": ["4.2 Vaccination batch", 138, 0, 0.0, 318.98550724637704, 229, 2417, 271.5, 431.1, 462.3999999999992, 1842.1399999999783, 0.32462338982093963, 6.78075391282921, 0.5219836231322393], "isController": false}, {"data": ["Log name and address", 1, 0, 0.0, 86.0, 86, 86, 86.0, 86.0, 86.0, 86.0, 11.627906976744185, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 72, 0, 0.0, 968.9999999999998, 320, 5553, 673.5, 1661.3000000000004, 3434.949999999996, 5553.0, 0.13473179951159722, 11.470877332661233, 0.08660677319679264], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1246, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
