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

    var data = {"OkPercent": 0.13527223537368954, "KoPercent": 99.86472776462631};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0017023346303501946, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.0, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.0, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [0.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.0, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0054249547920434, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2957, 2953, 99.86472776462631, 2.1224213730131862, 0, 44, 2.0, 5.0, 6.0, 9.0, 3.283742200140589, 0.3756703676553059, 2.2750782866294945], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Reset counters", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 602, 602, 100.0, 5.795681063122924, 2, 48, 5.0, 10.0, 13.0, 19.940000000000055, 0.6720332578319225, 0.23443674724181698, 1.345318031087678], "isController": true}, {"data": ["7.0 Open Children Search", 562, 562, 100.0, 1.6797153024911022, 1, 34, 1.0, 2.0, 4.7000000000000455, 8.0, 0.6329905197843327, 0.07232411212379582, 0.3807833595577626], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.1 Full name search", 57, 57, 100.0, 2.859649122807018, 2, 6, 2.0, 5.0, 6.0, 6.0, 0.07116184826046736, 0.008130797115697929, 0.05997331547732746], "isController": false}, {"data": ["7.8 Year group search", 65, 65, 100.0, 3.4615384615384617, 2, 12, 3.0, 6.0, 6.0, 12.0, 0.07747115093525558, 0.00885168423771963, 0.07807639430193725], "isController": false}, {"data": ["7.9 DOB search", 63, 63, 100.0, 3.142857142857142, 2, 6, 3.0, 5.0, 6.0, 6.0, 0.07768896298799151, 0.008876570966401372, 0.07571639166212453], "isController": false}, {"data": ["7.4 Partial name search", 68, 68, 100.0, 3.147058823529412, 2, 7, 3.0, 6.0, 6.0, 7.0, 0.08030278875052403, 0.009175220980284485, 0.0661086434733318], "isController": false}, {"data": ["1.2 Sign-in page", 602, 602, 100.0, 2.0066445182724246, 1, 8, 2.0, 5.0, 6.0, 7.0, 0.6715781864265348, 0.07673305450381306, 0.40727544313562314], "isController": false}, {"data": ["7.7 Due vaccination search", 66, 66, 100.0, 3.242424242424242, 2, 8, 3.0, 6.0, 6.0, 8.0, 0.07940384555230187, 0.009072509696893867, 0.0770000181967146], "isController": false}, {"data": ["7.2 First name search", 58, 58, 100.0, 3.2758620689655173, 2, 7, 3.0, 6.0, 6.0, 7.0, 0.06852859651071291, 0.00782992753100919, 0.05648255415531416], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.4 Open Sessions list", 35, 35, 100.0, 1.6857142857142855, 1, 3, 2.0, 2.0, 3.0, 3.0, 0.6234969270508596, 0.0712393949853033, 0.3750723701790327], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 57.2265625, 122.8515625], "isController": false}, {"data": ["7.5 Needs Consent search", 53, 53, 100.0, 2.7924528301886795, 2, 6, 2.0, 5.0, 6.0, 6.0, 0.061033609942259905, 0.006973566760980867, 0.0597819441133659], "isController": false}, {"data": ["1.1 Homepage", 605, 605, 100.0, 1.8214876033057839, 0, 42, 1.0, 2.0, 8.0, 13.879999999999882, 0.6734591421800261, 0.07694796839361627, 0.4031547403870665], "isController": false}, {"data": ["1.3 Sign-in", 599, 599, 100.0, 1.8731218697829715, 1, 11, 2.0, 3.0, 5.0, 6.0, 0.6716496567746912, 0.07674122054945204, 0.514231768468123], "isController": false}, {"data": ["Run some searches", 553, 550, 99.45750452079567, 3.130198915009042, 0, 12, 3.0, 6.0, 6.0, 7.0, 0.6303617797860189, 0.07163303241062656, 0.572095794044962], "isController": true}, {"data": ["7.6 Needs triage search", 54, 54, 100.0, 3.3148148148148144, 2, 7, 3.0, 6.0, 6.0, 7.0, 0.06556660474265107, 0.007491496830947437, 0.06415794721888318], "isController": false}, {"data": ["7.3 Last name search", 66, 66, 100.0, 3.03030303030303, 2, 11, 3.0, 5.0, 6.0, 11.0, 0.07655928646745012, 0.008747496598331704, 0.06310159939309366], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["464", 2953, 100.0, 99.86472776462631], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2957, 2953, "464", 2953, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.0 Open Children Search", 562, 562, "464", 562, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["7.1 Full name search", 57, 57, "464", 57, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.8 Year group search", 65, 65, "464", 65, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.9 DOB search", 63, 63, "464", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.4 Partial name search", 68, 68, "464", 68, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.2 Sign-in page", 602, 602, "464", 602, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.7 Due vaccination search", 66, 66, "464", 66, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.2 First name search", 58, 58, "464", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 35, 35, "464", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 53, 53, "464", 53, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.1 Homepage", 605, 605, "464", 605, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 599, 599, "464", 599, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["7.6 Needs triage search", 54, 54, "464", 54, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.3 Last name search", 66, 66, "464", 66, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
