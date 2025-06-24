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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6371794871794871, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6923076923076923, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9761904761904762, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.6923076923076923, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.9130434782608695, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8888888888888888, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.07142857142857142, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8589743589743589, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.95, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6956521739130435, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8260869565217391, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 319, 0, 0.0, 586.169278996865, 107, 1461, 488.0, 991.0, 1291.0, 1435.2, 0.5321145297291888, 12.308641022860908, 0.6641543742024537], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 36, 0, 0.0, 1166.916666666667, 949, 1461, 1148.0, 1430.7, 1452.5, 1461.0, 0.09382770106494441, 1.8990259389611708, 0.21833826173106896], "isController": false}, {"data": ["4.1 Vaccination questions", 39, 0, 0.0, 592.2820512820514, 471, 850, 562.0, 714.0, 730.0, 850.0, 0.0940990259544416, 1.0913069502686648, 0.18479092071071307], "isController": false}, {"data": ["2.0 Register attendance", 22, 0, 0.0, 2773.8636363636365, 2153, 3301, 2787.0, 3204.0, 3287.35, 3301.0, 0.04369709175992023, 7.814841192727016, 0.18749132575486727], "isController": true}, {"data": ["1.0 Login", 10, 0, 0.0, 1760.5, 1681, 1940, 1725.0, 1936.5, 1940.0, 1940.0, 0.18056082191286135, 8.652813137605403, 0.8596035222902334], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 9, 0, 0.0, 2292.4444444444443, 2096, 2491, 2319.0, 2491.0, 2491.0, 2491.0, 0.04741084127903914, 2.4669122125717746, 0.2810234403808671], "isController": true}, {"data": ["2.5 Select patient", 21, 0, 0.0, 394.3809523809524, 364, 503, 390.0, 435.6, 496.9999999999999, 503.0, 0.0499998809526644, 1.2489414087704553, 0.034667886207413796], "isController": false}, {"data": ["1.4 Select Organisations", 10, 0, 0.0, 433.8, 426, 460, 431.5, 457.8, 460.0, 460.0, 0.18838777740100224, 2.7067864930673298, 0.27227920952488605], "isController": false}, {"data": ["2.5 Select menacwy", 13, 0, 0.0, 586.0769230769231, 379, 738, 689.0, 729.2, 738.0, 738.0, 0.03411545193788888, 0.7711035233389054, 0.023787531917629553], "isController": false}, {"data": ["2.3 Search by first/last name", 23, 0, 0.0, 466.0869565217391, 387, 725, 426.0, 705.8, 721.4, 725.0, 0.044368567763341915, 1.4536263316598668, 0.03825922395999113], "isController": false}, {"data": ["2.5 Select td_ipv", 9, 0, 0.0, 458.8888888888889, 372, 690, 401.0, 690.0, 690.0, 690.0, 0.04837773334193382, 1.1095015296098605, 0.03368488659453009], "isController": false}, {"data": ["4.0 Vaccination for hpv", 21, 0, 0.0, 2050.0, 941, 2406, 2180.0, 2339.6, 2399.5, 2406.0, 0.050284346004190364, 2.384694889254714, 0.2784883829691709], "isController": true}, {"data": ["1.2 Sign-in page", 10, 0, 0.0, 109.5, 107, 114, 109.0, 113.7, 114.0, 114.0, 0.18846233580218993, 1.1357432365579239, 0.11355591913081171], "isController": false}, {"data": ["2.5 Select hpv", 21, 0, 0.0, 495.04761904761904, 363, 765, 410.0, 742.6, 763.6, 765.0, 0.05038569046390825, 1.032794186451048, 0.037543243968712885], "isController": false}, {"data": ["2.4 Patient attending session", 22, 0, 0.0, 659.318181818182, 601, 739, 660.5, 706.5, 734.3499999999999, 739.0, 0.04371393600279769, 1.3767270264638207, 0.06497325253540828], "isController": false}, {"data": ["1.5 Open Sessions list", 10, 0, 0.0, 337.79999999999995, 328, 362, 332.5, 361.1, 362.0, 362.0, 0.17680964673432584, 2.2387830855051454, 0.10567139043106191], "isController": false}, {"data": ["4.2 Vaccination batch", 39, 0, 0.0, 500.5384615384615, 464, 672, 481.0, 569.0, 666.0, 672.0, 0.09394285383937218, 1.8842392194553241, 0.1508599534862434], "isController": false}, {"data": ["1.1 Homepage", 10, 0, 0.0, 350.3, 319, 530, 327.0, 513.5, 530.0, 530.0, 0.185411799606927, 0.9569349227759855, 0.10049174685727], "isController": false}, {"data": ["1.3 Sign-in", 10, 0, 0.0, 529.1, 490, 742, 505.0, 720.7, 742.0, 742.0, 0.18841262364578426, 1.8283752355157794, 0.29641868817710787], "isController": false}, {"data": ["2.2 Session register", 23, 0, 0.0, 749.7826086956521, 388, 1303, 727.0, 1266.6000000000001, 1301.0, 1303.0, 0.04438372236630851, 3.182112382962054, 0.028648155036201682], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 9, 0, 0.0, 2327.4444444444443, 2139, 2474, 2301.0, 2474.0, 2474.0, 2474.0, 0.04793634053976319, 2.657559302912399, 0.28409667794502236], "isController": true}, {"data": ["2.1 Open session", 23, 0, 0.0, 515.5217391304348, 397, 778, 444.0, 745.8000000000001, 773.8, 778.0, 0.04445406542092201, 0.7459362732852327, 0.028302849481433662], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 319, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
