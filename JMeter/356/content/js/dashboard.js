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

    var data = {"OkPercent": 99.9828141783029, "KoPercent": 0.017185821697099892};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7285586213766312, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.46756756756756757, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9896396396396396, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8674033149171271, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9900900900900901, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.47093023255813954, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4828767123287671, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7530970406056435, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7017045454545454, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.49473684210526314, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.9223809523809524, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7570398351648352, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7530970406056435, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5766317016317016, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.48398576512455516, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9779279279279279, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7509009009009009, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9936936936936936, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3198554714384033, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.489247311827957, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5997101449275363, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.33695652173913043, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4690721649484536, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.6467661691542289, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7427966101694915, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9846846846846847, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9873873873873874, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.989247311827957, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.6990291262135923, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 23275, 4, 0.017185821697099892, 573.705606874325, 0, 10682, 191.0, 1394.0, 3689.0, 4542.990000000002, 6.340434620107854, 353.2254434916086, 50.037887140229714], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1110, 4, 0.36036036036036034, 1018.4585585585588, 423, 4201, 927.0, 1408.6, 1715.350000000001, 2631.580000000002, 0.4202426731068541, 67.73995702829369, 15.735025686978458], "isController": true}, {"data": ["2.5 Select patient", 1110, 0, 0.0, 126.92882882882876, 74, 2014, 90.0, 196.69999999999993, 315.7000000000003, 653.9200000000028, 0.41991231776845733, 10.692482507318202, 3.0292544943858477], "isController": false}, {"data": ["7.1 Full name search", 181, 0, 0.0, 537.5856353591159, 144, 5865, 248.0, 924.0000000000001, 2626.200000000003, 5511.580000000003, 0.051445080954945765, 1.906155105942049, 0.38113892498966123], "isController": false}, {"data": ["2.3 Search by first/last name", 1110, 0, 0.0, 123.31351351351356, 70, 1686, 88.0, 183.89999999999998, 275.45000000000005, 665.8100000000029, 0.42037110815883516, 13.359638945006749, 3.1445618428861093], "isController": false}, {"data": ["4.0 Vaccination for flu", 258, 0, 0.0, 894.6511627906984, 572, 3280, 781.0, 1230.3, 1574.549999999999, 2865.3800000000056, 0.10959453420623823, 5.878798958597054, 3.127217095701303], "isController": true}, {"data": ["4.0 Vaccination for hpv", 292, 0, 0.0, 836.8869863013699, 562, 3481, 773.5, 1087.0, 1324.8499999999997, 2066.159999999999, 0.11235116356559499, 5.59657650229281, 3.2085205972964923], "isController": true}, {"data": ["1.2 Sign-in page", 2906, 0, 0.0, 754.2825189263591, 12, 10107, 191.0, 2015.2000000000116, 3871.65, 5074.8299999999945, 0.8102514372483125, 54.52327273687935, 7.041445125156801], "isController": false}, {"data": ["7.2 First name search", 176, 0, 0.0, 1039.0454545454543, 149, 10682, 431.5, 3245.700000000001, 5220.65, 9721.809999999987, 0.04959457841086009, 4.665572043786236, 0.36691495877098435], "isController": false}, {"data": ["7.7 Due vaccination search", 190, 0, 0.0, 720.768421052632, 570, 2500, 646.0, 915.1, 1142.2499999999993, 2153.2900000000013, 0.05477433263241407, 7.353168122174438, 0.4150360642133916], "isController": false}, {"data": ["2.4 Patient attending session", 1050, 4, 0.38095238095238093, 407.1019047619047, 214, 2006, 354.0, 554.9, 712.3499999999998, 1255.92, 0.3972819858348162, 13.104990334105638, 3.4859916509535336], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 9.219898897058822, 17.348345588235293], "isController": false}, {"data": ["1.1 Homepage", 2912, 0, 0.0, 750.0511675824171, 30, 9750, 192.0, 2130.6000000000076, 3887.0499999999997, 5165.529999999998, 0.8085320118425506, 64.80318397527105, 7.014420731203644], "isController": false}, {"data": ["1.3 Sign-in", 2906, 0, 0.0, 758.3138334480407, 72, 9947, 215.0, 1905.0, 3879.3, 5099.009999999991, 0.8094470774531665, 54.72407486819675, 7.272445722339597], "isController": false}, {"data": ["Run some searches", 1716, 0, 0.0, 1223.9073426573425, 0, 10682, 642.5, 3836.2, 4147.15, 5849.189999999993, 0.4801336315981651, 47.555603543853465, 3.593280736963854], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 281, 0, 0.0, 834.9323843416373, 573, 2768, 742.0, 1118.6000000000001, 1342.5999999999976, 2223.34, 0.10784377313507988, 5.4660108047419405, 3.0804092023552156], "isController": true}, {"data": ["2.1 Open session", 1110, 0, 0.0, 242.85945945945946, 122, 2072, 207.0, 353.79999999999995, 483.0500000000004, 747.800000000002, 0.4202808612047067, 9.737123003216285, 3.0342578035222947], "isController": false}, {"data": ["4.3 Vaccination confirm", 1110, 0, 0.0, 555.8315315315317, 374, 2464, 499.0, 769.8, 915.45, 1431.0400000000036, 0.4194069811992319, 9.064533008037879, 4.324083983626691], "isController": false}, {"data": ["4.1 Vaccination questions", 1110, 0, 0.0, 145.27657657657647, 82, 1675, 108.0, 237.0, 378.1500000000003, 567.4700000000023, 0.4196019905011182, 5.9545632679236205, 3.93518881936002], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 2906, 0, 0.0, 2470.657949070884, 330, 28999, 990.5, 5479.900000000041, 11753.2, 15215.949999999964, 0.8095102128933861, 201.21013417697938, 23.701127329065486], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 279, 0, 0.0, 838.6917562724016, 572, 2541, 766.0, 1132.0, 1274.0, 1927.3999999999946, 0.10695830887796133, 5.800283918722419, 3.0553321400517466], "isController": true}, {"data": ["7.0 Open Children Search", 1725, 0, 0.0, 1156.7901449275346, 89, 10478, 620.0, 3786.2000000000007, 4047.0999999999995, 5387.820000000001, 0.48068670484665954, 46.605698158165296, 3.4676114082002645], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 6.108710106382978, 13.131648936170214], "isController": false}, {"data": ["7.8 Year group search", 184, 0, 0.0, 1523.6249999999998, 1326, 2732, 1425.5, 1751.0, 2182.75, 2622.350000000001, 0.053532162647002515, 7.402717113650526, 0.4076670680790914], "isController": false}, {"data": ["7.9 DOB search", 194, 0, 0.0, 883.7783505154641, 529, 3406, 815.5, 1395.5, 1686.25, 2940.5000000000055, 0.05631513251473192, 5.341056140054864, 0.4253244492764667], "isController": false}, {"data": ["7.4 Partial name search", 201, 0, 0.0, 1257.7263681592042, 150, 9035, 476.0, 3522.6, 5763.999999999998, 8948.739999999998, 0.058829417518522484, 5.4935215567376074, 0.43504626359296134], "isController": false}, {"data": ["Debug Sampler", 1110, 0, 0.0, 0.3297297297297293, 0, 5, 0.0, 1.0, 1.0, 1.0, 0.42048321476464307, 2.4076392992704045, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1180, 0, 0.0, 511.15847457627075, 320, 2103, 504.0, 702.9000000000001, 822.6000000000004, 1118.5100000000016, 0.42422893694340175, 34.99684606120509, 3.059619197905316], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1110, 0, 0.0, 149.16396396396385, 82, 2228, 102.0, 223.89999999999998, 345.35000000000014, 1065.600000000004, 0.4198062310590803, 6.813403718008212, 3.722621338537985], "isController": false}, {"data": ["7.5 Needs Consent search", 194, 0, 0.0, 4037.237113402061, 3590, 10434, 3928.5, 4376.5, 4586.75, 7371.200000000037, 0.058172484414871765, 7.998597132306419, 0.44135373968113084], "isController": false}, {"data": ["2.2 Session register", 1110, 0, 0.0, 139.93063063063065, 69, 1693, 90.0, 260.0, 354.7000000000003, 671.6700000000003, 0.4203626707344645, 18.4331993449017, 3.0385319341426134], "isController": false}, {"data": ["7.6 Needs triage search", 186, 0, 0.0, 188.5967741935484, 142, 789, 170.0, 231.60000000000002, 282.65, 665.4599999999994, 0.05339360878502843, 3.6593379191613584, 0.4050290854327882], "isController": false}, {"data": ["7.3 Last name search", 206, 0, 0.0, 777.6553398058247, 147, 6200, 481.0, 1930.700000000003, 3277.95, 5451.130000000005, 0.060549145478139846, 5.631187354321989, 0.44795155912212553], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 100.0, 0.017185821697099892], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 23275, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1050, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
