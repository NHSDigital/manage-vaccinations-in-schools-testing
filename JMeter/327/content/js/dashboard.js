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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.88170577677325, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.5468106995884774, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9932572614107884, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6538461538461539, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9902363823227133, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.519650655021834, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5102880658436214, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.038461538461538464, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9875373878364905, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.978688524590164, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9875621890547264, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9775224775224776, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5084388185654009, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9761663286004056, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3076923076923077, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.9196525515743756, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9994725738396625, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.2692307692307692, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.481018981018981, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5084388185654009, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.35714285714285715, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8919878296146044, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9877425944841676, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9615384615384616, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12111, 0, 0.0, 190.23218561638205, 0, 12016, 94.0, 400.0, 498.39999999999964, 1176.2799999999952, 5.984925755491247, 177.0464759632538, 45.14948689892537], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 13, 0, 0.0, 111.07692307692308, 79, 215, 91.0, 202.6, 215.0, 215.0, 0.008164557280021705, 0.2473605713431576, 0.06066746904376705], "isController": false}, {"data": ["2.0 Register attendance", 972, 0, 0.0, 757.9269547325107, 384, 12738, 661.5, 934.7, 1087.7499999999995, 3658.519999999993, 0.5474372390239397, 70.45890522901124, 17.424318878530887], "isController": true}, {"data": ["2.5 Select patient", 964, 0, 0.0, 111.06535269709534, 56, 2867, 86.0, 139.5, 219.0, 649.2500000000072, 0.5477618190692709, 13.731788113660862, 3.9502741055330763], "isController": false}, {"data": ["7.1 Full name search", 13, 0, 0.0, 710.0000000000001, 383, 1788, 562.0, 1737.2, 1788.0, 1788.0, 0.00816046743157448, 0.32536001883341725, 0.06021348508611804], "isController": false}, {"data": ["2.3 Search by first/last name", 973, 0, 0.0, 112.89208633093551, 58, 3690, 82.0, 136.20000000000005, 211.29999999999995, 823.6599999999992, 0.5486249136606476, 15.582064893714495, 4.102519501240467], "isController": false}, {"data": ["4.0 Vaccination for flu", 229, 0, 0.0, 635.9781659388648, 178, 1154, 609.0, 808.0, 954.0, 1097.8999999999994, 0.13365316711314998, 6.960896508529873, 3.758314223739195], "isController": true}, {"data": ["4.0 Vaccination for hpv", 243, 0, 0.0, 649.7448559670778, 166, 2100, 623.0, 792.0, 892.5999999999999, 1509.0400000000004, 0.1419109033125392, 6.868989705510056, 4.009233383831909], "isController": true}, {"data": ["7.6 First name search", 13, 0, 0.0, 2381.153846153846, 1349, 3715, 2141.0, 3604.6, 3715.0, 3715.0, 0.008172168736425556, 1.0912018451028278, 0.06023720800212476], "isController": false}, {"data": ["1.2 Sign-in page", 1003, 0, 0.0, 114.10568295114656, 14, 3485, 79.0, 129.0, 184.79999999999995, 1200.5600000000013, 0.5587307953697205, 11.6381172525193, 4.656486358654478], "isController": false}, {"data": ["2.4 Patient attending session", 305, 0, 0.0, 317.7508196721311, 230, 1046, 291.0, 397.4000000000002, 479.09999999999985, 820.1799999999998, 0.1753700019549443, 5.369510299034602, 1.539282790596718], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1005, 0, 0.0, 123.74129353233839, 30, 3788, 85.0, 140.19999999999993, 206.49999999999966, 1207.6599999999976, 0.5585899743937909, 28.100817122818373, 4.641562336035778], "isController": false}, {"data": ["1.3 Sign-in", 1001, 0, 0.0, 151.36863136863113, 56, 4667, 84.0, 268.60000000000014, 389.9, 1632.1600000000035, 0.5587106676899464, 12.05177246127817, 4.917103450080234], "isController": false}, {"data": ["Run some searches", 13, 0, 0.0, 8967.923076923074, 6369, 13949, 8892.0, 12791.4, 13949.0, 13949.0, 0.008100450571985277, 5.398907710709855, 0.47989753923110523], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 237, 0, 0.0, 646.4852320675105, 165, 1180, 628.0, 785.4000000000001, 863.5999999999999, 1136.4800000000005, 0.13838333234071026, 6.876423611232756, 3.927429912053597], "isController": true}, {"data": ["2.1 Open session", 986, 0, 0.0, 295.1632860040567, 109, 3694, 265.0, 421.0, 483.65, 846.9499999999999, 0.5526747834002503, 12.783255898373982, 3.989186469094774], "isController": false}, {"data": ["7.7 Partial name search", 13, 0, 0.0, 1739.8461538461538, 833, 3458, 1297.0, 3232.0, 3458.0, 3458.0, 0.008184619840148078, 1.0948908789494725, 0.0603209925268125], "isController": false}, {"data": ["4.3 Vaccination confirm", 921, 0, 0.0, 435.95114006514666, 311, 1715, 403.0, 545.4000000000002, 627.9, 847.3399999999999, 0.5479569416506177, 11.561137079817872, 5.647989203284886], "isController": false}, {"data": ["4.1 Vaccination questions", 948, 0, 0.0, 114.02215189873402, 66, 707, 102.0, 153.20000000000005, 198.54999999999995, 309.2999999999997, 0.5494046956715256, 7.74316507216877, 5.150552434607512], "isController": false}, {"data": ["7.7 Last name search", 13, 0, 0.0, 1822.3846153846152, 1149, 4284, 1423.0, 3923.9999999999995, 4284.0, 4284.0, 0.008173761596524266, 1.0953448413740094, 0.06026429936716223], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1001, 0, 0.0, 810.7482517482504, 247, 10270, 646.0, 972.2000000000003, 1214.7999999999995, 4246.6, 0.5585008742965735, 97.06414614087613, 18.175418164278486], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 237, 0, 0.0, 647.0168776371308, 187, 1304, 621.0, 784.2000000000005, 885.3, 1038.46, 0.1386412455950693, 7.373654481592888, 3.9289872602515548], "isController": true}, {"data": ["7.0 Open Children Search", 14, 0, 0.0, 1536.1428571428573, 642, 2957, 1188.0, 2804.5, 2957.0, 2957.0, 0.008068885225871151, 1.007262649598573, 0.05817015603927242], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 6.241508152173913, 13.41711956521739], "isController": false}, {"data": ["7.5 year group", 13, 0, 0.0, 1958.2307692307693, 1714, 3690, 1802.0, 3016.7999999999993, 3690.0, 3690.0, 0.008163747185077173, 1.0974168667569704, 0.060860759795240665], "isController": false}, {"data": ["7.2 No Consent search", 13, 0, 0.0, 103.3076923076923, 83, 229, 92.0, 180.59999999999997, 229.0, 229.0, 0.008170966795076553, 0.24755475961958492, 0.06085872579115386], "isController": false}, {"data": ["Debug Sampler", 972, 0, 0.0, 0.29218106995884796, 0, 6, 0.0, 1.0, 1.0, 1.0, 0.5484194573806991, 2.9904306984632405, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 986, 0, 0.0, 428.15922920892496, 309, 4393, 355.5, 555.3000000000001, 639.1999999999998, 987.91, 0.5532003707452383, 45.47157809049511, 3.9881410388132337], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 946, 0, 0.0, 106.5771670190274, 70, 482, 94.0, 133.0, 187.0, 350.2999999999997, 0.5501132209768754, 8.900324952417533, 4.876387440351095], "isController": false}, {"data": ["2.2 Session register", 979, 0, 0.0, 140.5985699693561, 59, 12016, 80.0, 220.0, 275.0, 681.6000000000183, 0.5506982730349662, 20.487769200188104, 3.9797378878021177], "isController": false}, {"data": ["7.3 Due vaccination", 13, 0, 0.0, 141.9230769230769, 83, 618, 89.0, 463.59999999999985, 618.0, 618.0, 0.00816474700903335, 0.2473663195393073, 0.06055725144154889], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12111, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
