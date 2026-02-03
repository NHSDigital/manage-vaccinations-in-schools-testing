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

    var data = {"OkPercent": 99.90262901655306, "KoPercent": 0.09737098344693282};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.834373293814835, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.41509433962264153, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9928656361474435, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.991812865497076, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4716981132075472, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.46875, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9714611872146118, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.767639902676399, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9812072892938497, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9748283752860412, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.47, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9034883720930232, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5758145363408521, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9897094430992736, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.5732265446224256, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4797979797979798, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.18181818181818182, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.36363636363636365, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.9668989547038328, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9908312958435208, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9935897435897436, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8181818181818182, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10270, 10, 0.09737098344693282, 294.0085686465431, 2, 13575, 122.0, 564.0, 735.4499999999989, 3080.4299999999366, 5.298102072295621, 2181.0614544131718, 25.51941701048013], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 11, 0, 0.0, 132.0909090909091, 79, 407, 94.0, 362.60000000000014, 407.0, 407.0, 0.0066855645290688345, 2.7773036366128254, 0.029237474139020843], "isController": false}, {"data": ["2.0 Register attendance", 848, 7, 0.8254716981132075, 1293.0400943396219, 465, 8352, 1142.5, 1712.6000000000004, 2069.6499999999987, 4774.039999999996, 0.4817464672872561, 985.53268399729, 10.459166332554473], "isController": true}, {"data": ["2.5 Select patient", 841, 0, 0.0, 111.385255648038, 57, 5172, 85.0, 150.8000000000004, 214.19999999999982, 528.3400000000009, 0.47954574872144895, 195.34274446319958, 1.9925061710866416], "isController": false}, {"data": ["7.1 Full name search", 11, 0, 0.0, 7144.636363636364, 5870, 9978, 6531.0, 9606.000000000002, 9978.0, 9978.0, 0.006640126283128948, 3.335951341456421, 0.028698031579836955], "isController": false}, {"data": ["2.3 Search by first/last name", 855, 0, 0.0, 114.12163742690053, 55, 3436, 80.0, 144.39999999999998, 201.5999999999998, 528.519999999998, 0.4821141296655819, 199.30705389006894, 2.0821590318302463], "isController": false}, {"data": ["4.0 Vaccination for flu", 212, 1, 0.4716981132075472, 986.1745283018871, 111, 6815, 831.5, 1357.8000000000004, 1793.7499999999998, 5886.020000000002, 0.12475468344970238, 147.41235461684275, 2.0790416729191126], "isController": true}, {"data": ["4.0 Vaccination for hpv", 208, 0, 0.0, 1017.1875000000001, 182, 9336, 809.0, 1290.1, 1743.1499999999999, 6830.799999999997, 0.12170682114070888, 144.7323183631749, 2.0501781214800836], "isController": true}, {"data": ["7.6 First name search", 11, 0, 0.0, 5341.636363636363, 4784, 6484, 5267.0, 6390.6, 6484.0, 6484.0, 0.006663339035536193, 3.2808686563497984, 0.028755171091830505], "isController": false}, {"data": ["1.2 Sign-in page", 876, 0, 0.0, 194.16552511415526, 13, 6379, 98.0, 252.0, 413.44999999999993, 4467.280000000001, 0.48798232122494706, 196.95411728033275, 2.3961358126242587], "isController": false}, {"data": ["2.4 Patient attending session", 822, 7, 0.851581508515815, 566.0900243309012, 65, 7322, 482.5, 764.7, 1005.9499999999994, 1699.85, 0.4666882789138086, 193.42224358775556, 2.3770259796195754], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 23.0, 23, 23, 23.0, 23.0, 23.0, 23.0, 43.47826086956522, 13.629415760869566, 25.64538043478261], "isController": false}, {"data": ["1.1 Homepage", 878, 0, 0.0, 177.17881548974938, 28, 6199, 101.0, 198.0, 280.8999999999992, 2750.5100000000957, 0.48777127416078897, 196.66493964976303, 2.381637081644467], "isController": false}, {"data": ["1.3 Sign-in", 874, 0, 0.0, 213.11899313501118, 65, 6008, 104.0, 331.0, 427.25, 4482.5, 0.4882048807081987, 197.38934543469784, 2.5534296366685996], "isController": false}, {"data": ["Run some searches", 11, 0, 0.0, 27653.272727272724, 22474, 34702, 26232.0, 34425.6, 34702.0, 34702.0, 0.006549369444571793, 25.79104009791903, 0.2278400270742002], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 200, 0, 0.0, 1020.3300000000002, 192, 9323, 847.5, 1373.7000000000005, 1670.9999999999998, 6431.630000000023, 0.11822762601291519, 141.1073554366161, 1.988301182438823], "isController": true}, {"data": ["2.1 Open session", 860, 0, 0.0, 408.4569767441859, 178, 5257, 327.0, 632.9, 809.9499999999986, 1786.17, 0.4828501182702063, 195.75722335969218, 2.0099984977606424], "isController": false}, {"data": ["7.7 Partial name search", 11, 0, 0.0, 5686.818181818181, 1765, 13575, 5125.0, 12072.200000000004, 13575.0, 13575.0, 0.006670555802837775, 3.2387295416706587, 0.028779800329040324], "isController": false}, {"data": ["4.3 Vaccination confirm", 798, 1, 0.12531328320802004, 733.7117794486211, 27, 9164, 581.0, 968.4000000000001, 1317.4499999999996, 4394.299999999992, 0.4778503202734885, 193.3172559729793, 2.8794336635370863], "isController": false}, {"data": ["4.1 Vaccination questions", 826, 1, 0.12106537530266344, 151.55326876513314, 59, 4545, 108.0, 213.0, 283.94999999999993, 709.870000000004, 0.48206243350485656, 190.60298226067877, 2.7500984067938705], "isController": false}, {"data": ["7.7 Last name search", 11, 0, 0.0, 5563.090909090909, 4983, 7471, 5213.0, 7261.000000000001, 7471.0, 7471.0, 0.006665293212307767, 3.35041460680072, 0.028761237267775127], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 874, 0, 0.0, 859.4416475972542, 358, 18586, 597.5, 1028.0, 1514.5, 9264.75, 0.4881579799866399, 812.7053045709237, 9.329968591411491], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 198, 0, 0.0, 942.5252525252529, 193, 4683, 816.0, 1315.3999999999999, 1697.7499999999993, 4617.66, 0.11778815265344583, 139.98093550600422, 1.9774103246595447], "isController": true}, {"data": ["7.0 Open Children Search", 11, 0, 0.0, 3942.0909090909095, 312, 6752, 4957.0, 6429.600000000001, 6752.0, 6752.0, 0.006645128395962661, 3.201767869392116, 0.027587547867578298], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 11, 0, 0.0, 1467.4545454545455, 1344, 1755, 1417.0, 1723.4, 1755.0, 1755.0, 0.0066808665448319544, 3.3599604536353938, 0.029380035892955514], "isController": false}, {"data": ["7.2 No Consent search", 11, 0, 0.0, 1815.3636363636365, 1640, 2407, 1784.0, 2299.8, 2407.0, 2407.0, 0.006670927974597106, 3.5891742314105497, 0.029290727607210913], "isController": false}, {"data": ["1.4 Open Sessions list", 861, 0, 0.0, 278.9814169570265, 147, 4023, 224.0, 395.6000000000005, 561.9, 1284.5, 0.48264442055201967, 222.3030035786318, 2.0039599282507865], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 818, 1, 0.12224938875305623, 124.5256723716382, 25, 1810, 94.0, 181.20000000000005, 275.0999999999999, 556.6299999999987, 0.47978396817706725, 190.97335773884797, 2.492294858444667], "isController": false}, {"data": ["2.2 Session register", 858, 0, 0.0, 115.75757575757574, 56, 1049, 81.0, 218.4000000000001, 330.2499999999998, 561.9799999999975, 0.48309913160397355, 203.43040599910728, 2.01527632967687], "isController": false}, {"data": ["7.3 Due vaccination", 11, 0, 0.0, 502.18181818181813, 298, 1116, 367.0, 1079.8000000000002, 1116.0, 1116.0, 0.006683570022851733, 3.332485925009129, 0.029137374781796628], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 1, 10.0, 0.009737098344693282], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 1, 10.0, 0.009737098344693282], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 70.0, 0.06815968841285297], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 1, 10.0, 0.009737098344693282], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10270, 10, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "Test failed: text expected to contain /Check and confirm/", 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 822, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 798, 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 826, 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 818, 1, "Test failed: text expected to contain /Check and confirm/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
