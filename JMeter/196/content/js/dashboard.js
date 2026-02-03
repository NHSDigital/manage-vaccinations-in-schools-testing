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

    var data = {"OkPercent": 99.83960078417394, "KoPercent": 0.16039921582605596};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7977292450101244, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3978102189781022, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9758254716981132, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.29418472063854045, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.45316027088036115, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.32439024390243903, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9902522935779816, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9897377423033067, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3051643192488263, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.30227272727272725, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9785794813979707, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4386503067484663, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.8731596828992072, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9839857651245552, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Add vaccination row to STS"], "isController": false}, {"data": [0.9815022421524664, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9734762979683973, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9777904328018223, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.3, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5, 500, 1500, "Data prep Homepage"], "isController": false}, {"data": [0.8907849829351536, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11222, 18, 0.16039921582605596, 311.4705043664237, 1, 4368, 124.0, 892.0, 1115.7000000000007, 1859.0, 6.019485280904844, 2208.3345060107686, 26.547881098570816], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 822, 0, 0.0, 1245.2773722627746, 777, 4185, 1078.0, 1863.9000000000003, 2262.999999999998, 3091.889999999999, 0.4941364874710551, 199.62305960694206, 2.9883338027229205], "isController": false}, {"data": ["4.1 Vaccination questions", 848, 0, 0.0, 182.14976415094324, 88, 1611, 126.0, 307.8000000000002, 486.54999999999995, 953.8799999999992, 0.4966511189877688, 196.08896463579018, 2.8424696216651753], "isController": false}, {"data": ["2.0 Register attendance", 877, 16, 1.8244013683010263, 1417.3968072976043, 446, 5654, 1409.0, 2226.2, 2590.6999999999966, 3921.0800000000004, 0.4942270671878311, 921.7948916153913, 9.722710992903306], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 429.0, 429, 429, 429.0, 429.0, 429.0, 429.0, 2.331002331002331, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 886, 0, 0.0, 990.7065462753956, 421, 3222, 868.0, 1483.1000000000004, 1790.0, 2390.7499999999995, 0.49440115799241885, 822.8371831548081, 9.503775441292095], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 205, 0, 0.0, 1510.5609756097563, 232, 3368, 1385.0, 2153.2, 2344.0, 3215.5399999999995, 0.12152144853566654, 144.00328932256238, 2.043591095886351], "isController": true}, {"data": ["2.5 Select patient", 872, 0, 0.0, 127.1353211009174, 66, 1038, 95.0, 204.10000000000014, 332.4999999999991, 745.1799999999994, 0.49871432362441775, 202.8291190373398, 2.0792640995103793], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1247.55859375, 0.0], "isController": false}, {"data": ["2.3 Search by first/last name", 877, 0, 0.0, 129.78335233751434, 70, 1239, 96.0, 188.60000000000014, 302.0, 742.0800000000004, 0.49410900371398697, 201.33450795289428, 2.1410381454827054], "isController": false}, {"data": ["4.0 Vaccination for flu", 213, 0, 0.0, 1557.7511737089196, 254, 4456, 1406.0, 2176.4, 2537.999999999998, 3967.5799999999977, 0.12576737287309955, 149.1320177262248, 2.115606237301481], "isController": true}, {"data": ["4.0 Vaccination for hpv", 220, 0, 0.0, 1586.3590909090913, 275, 3703, 1395.5, 2365.3, 2798.1499999999996, 3563.64, 0.12980721857942518, 153.70109282558454, 2.1871202585700793], "isController": true}, {"data": ["1.2 Sign-in page", 887, 0, 0.0, 161.76211950394594, 18, 2433, 110.0, 295.00000000000045, 452.0, 1092.16, 0.4941751954136976, 198.53320683557948, 2.434825140083625], "isController": false}, {"data": ["2.4 Patient attending session", 489, 16, 3.2719836400817996, 1020.2576687116563, 54, 4368, 911.0, 1440.0, 1765.5, 3019.2000000000016, 0.27836505784186816, 113.68755927354121, 1.4173099544753587], "isController": false}, {"data": ["1.4 Open Sessions list", 883, 0, 0.0, 496.6070215175539, 357, 2168, 435.0, 667.2, 864.1999999999998, 1443.7199999999993, 0.4939981739410648, 227.2220660606471, 2.058254882392909], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 58.0, 58, 58, 58.0, 58.0, 58.0, 58.0, 17.241379310344826, 43.01926185344827, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch", 843, 0, 0.0, 167.22775800711767, 85, 1317, 116.0, 294.0, 397.79999999999995, 824.5199999999991, 0.4956942806993817, 196.9966473198404, 2.583996623339968], "isController": false}, {"data": ["Add vaccination row to STS", 1162, 0, 0.0, 44.196213425129045, 1, 56, 44.0, 48.0, 48.0, 48.0, 19.770646884676896, 5.657030798056964, 15.967031154294416], "isController": false}, {"data": ["1.1 Homepage", 892, 0, 0.0, 153.5482062780271, 36, 1574, 110.0, 231.0, 367.24999999999864, 1035.5699999999968, 0.4958172368750174, 199.07866413002697, 2.4297144239320754], "isController": false}, {"data": ["1.3 Sign-in", 886, 0, 0.0, 181.0699774266365, 76, 1469, 116.0, 350.9000000000002, 505.94999999999993, 896.78, 0.49475012047668004, 199.20975111269914, 2.594432868418525], "isController": false}, {"data": ["2.2 Session register", 878, 0, 0.0, 168.9476082004557, 68, 1533, 103.0, 319.20000000000005, 478.14999999999986, 1092.9300000000012, 0.4939594053133829, 209.01480793460271, 2.065676092519497], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 205, 0, 0.0, 1599.1121951219513, 228, 3785, 1435.0, 2485.8, 2930.0, 3590.619999999999, 0.12142521213873038, 144.4902689909032, 2.045338633260024], "isController": true}, {"data": ["Data prep Homepage", 1, 0, 0.0, 735.0, 735, 735, 735.0, 735.0, 735.0, 735.0, 1.3605442176870748, 528.9261798469388, 4.485544217687075], "isController": false}, {"data": ["2.1 Open session", 879, 0, 0.0, 423.6450511945392, 176, 3158, 323.0, 728.0, 981.0, 1809.800000000002, 0.4941608625721214, 198.84206005786714, 2.0621966307673887], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, 88.88888888888889, 0.14257708073427197], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 11.11111111111111, 0.017822135091783996], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11222, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 489, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
