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

    var data = {"OkPercent": 99.93180711154409, "KoPercent": 0.06819288845591817};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6412120735733375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9230769230769231, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.1070110701107011, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9011090573012939, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.34615384615384615, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9047764849969382, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.21119592875318066, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.20465116279069767, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.21153846153846154, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.8553025763930497, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.413623595505618, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8752244165170556, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8385260635110845, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.18701298701298702, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.41554878048780486, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3076923076923077, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.34825396825396826, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.843143393863494, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.25, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.2121030557219892, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2025974025974026, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.42592592592592593, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.9038461538461539, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5195121951219512, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8441028858218319, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8672782874617737, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9615384615384616, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20530, 14, 0.06819288845591817, 696.3826108134407, 0, 16259, 243.0, 1730.0, 2816.9000000000015, 6072.990000000002, 5.183877409000605, 838.6970150813146, 38.887975611046706], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 308.3076923076923, 84, 1922, 179.0, 791.6000000000001, 1558.6999999999985, 1922.0, 0.007541653130366176, 1.5309377397556794, 0.0554477498498921], "isController": false}, {"data": ["2.0 Register attendance", 1626, 14, 0.8610086100861009, 3362.215867158676, 541, 20464, 2376.5, 7017.799999999999, 9125.099999999993, 13068.970000000001, 0.45669102913890985, 346.4732049647279, 14.882048188522115], "isController": true}, {"data": ["2.5 Select patient", 1623, 0, 0.0, 375.6457178065314, 59, 9056, 127.0, 774.4000000000019, 1623.9999999999998, 4292.279999999999, 0.4556215359919959, 78.09963414211771, 3.2488420584296023], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1800.7692307692303, 308, 7674, 895.0, 4839.0, 6747.899999999996, 7674.0, 0.007539704518979902, 1.5256942119500836, 0.05502874186110646], "isController": false}, {"data": ["2.3 Search by first/last name", 1633, 0, 0.0, 356.1353337415799, 63, 9453, 135.0, 730.6000000000008, 1436.0999999999992, 3630.460000000011, 0.45689964631546665, 81.64908885916454, 3.3796374404778393], "isController": false}, {"data": ["4.0 Vaccination for flu", 393, 0, 0.0, 2784.9567430025463, 173, 16486, 1733.0, 6230.800000000001, 8383.799999999997, 12947.02, 0.11172450613077567, 52.60115884014113, 3.1354435783603845], "isController": true}, {"data": ["4.0 Vaccination for hpv", 430, 0, 0.0, 2698.6976744186036, 201, 16724, 1780.5, 5938.300000000006, 7506.55, 12511.75, 0.12287051819069447, 57.523168057722856, 3.4586396114655624], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 2977.538461538462, 541, 13481, 1547.5, 8172.400000000005, 13374.25, 13481.0, 0.00753827923699857, 2.2201093093979436, 0.05496425994900644], "isController": false}, {"data": ["1.2 Sign-in page", 1669, 0, 0.0, 469.59976033553085, 21, 10517, 156.0, 1225.0, 2011.5, 4551.699999999996, 0.4646551654537097, 80.48862446367337, 3.8967606332151603], "isController": false}, {"data": ["2.4 Patient attending session", 712, 14, 1.9662921348314606, 1329.5800561797764, 182, 13664, 758.5, 2880.1000000000013, 4336.300000000005, 8867.800000000003, 0.21545984942019514, 22.09520914613065, 1.8638810130925145], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1671, 0, 0.0, 413.55834829443444, 36, 8196, 157.0, 950.9999999999995, 1883.7999999999997, 3776.9599999999955, 0.46433085921771783, 81.24959094693415, 3.8856413127996374], "isController": false}, {"data": ["1.3 Sign-in", 1669, 0, 0.0, 522.7950868783696, 68, 9777, 175.0, 1257.0, 2144.0, 4589.299999999995, 0.4646378316529999, 81.69139800152142, 4.05529870301945], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 12907.461538461539, 5042, 30832, 11663.0, 23653.300000000003, 29027.749999999993, 30832.0, 0.007549602339215248, 14.900989619478265, 0.4424774745999437], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 385, 0, 0.0, 2829.7610389610395, 465, 17065, 1826.0, 6063.4000000000015, 7980.099999999999, 13454.81999999999, 0.11084760412260954, 55.42009851868732, 3.1225908415909998], "isController": true}, {"data": ["2.1 Open session", 1640, 0, 0.0, 1563.5225609756121, 134, 11005, 1066.0, 3377.5000000000014, 4625.549999999998, 7409.31999999998, 0.45753107305543717, 78.30830748576282, 3.2657746086505175], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 2440.9615384615377, 552, 9299, 1169.5, 6808.700000000001, 8610.899999999998, 9299.0, 0.007571402695535843, 2.074829667554996, 0.05519838085189346], "isController": false}, {"data": ["4.3 Vaccination confirm", 1575, 0, 0.0, 1736.408253968252, 459, 16259, 1016.0, 3745.600000000002, 5617.199999999999, 10617.32, 0.4528778446120044, 74.69347566250637, 4.6164050299704495], "isController": false}, {"data": ["4.1 Vaccination questions", 1597, 0, 0.0, 508.0250469630552, 73, 8500, 182.0, 1244.0, 2086.5999999999995, 4503.24, 0.4531293447358117, 71.9576433589915, 4.20458954172436], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 2433.846153846154, 789, 9872, 1497.5, 5179.400000000003, 9211.549999999997, 9872.0, 0.007565632590184523, 2.2914574523736153, 0.055168533741120934], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1669, 0, 0.0, 2404.669263031752, 590, 15433, 1702.0, 4641.0, 6186.0, 10649.499999999989, 0.46469759991624865, 349.9152811979077, 15.097097984022644], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 385, 0, 0.0, 2810.3532467532455, 235, 14171, 1770.0, 6264.400000000003, 9285.699999999997, 13306.579999999998, 0.11053527496439186, 55.25985509677794, 3.1081546977420085], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1353.4814814814813, 421, 4756, 790.0, 3578.3999999999996, 4379.999999999998, 4756.0, 0.00757499880062519, 2.1501993557323242, 0.05401515529308652], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 2441.615384615385, 1824, 4517, 2209.0, 3531.8, 4207.949999999999, 4517.0, 0.007537079532422777, 2.178284493480716, 0.05559813456919213], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 319.1923076923077, 78, 2062, 113.5, 1179.4, 1818.749999999999, 2062.0, 0.007543158471315109, 1.5419667656053444, 0.05559141200165833], "isController": false}, {"data": ["Debug Sampler", 1633, 0, 0.0, 0.28046540110226575, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.45693020132350265, 2.559150091550429, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1640, 0, 0.0, 1015.9847560975597, 315, 10497, 745.0, 1752.900000000001, 2517.6499999999987, 4888.18, 0.4575666882522822, 106.5361926291761, 3.2622995961660095], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 286.1328125, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 1594, 0, 0.0, 553.2057716436643, 68, 11569, 175.0, 1294.0, 2406.0, 6073.1, 0.4528159527571492, 73.2899756709964, 3.9705267420098154], "isController": false}, {"data": ["2.2 Session register", 1635, 0, 0.0, 477.3229357798165, 61, 12201, 155.0, 1037.4000000000005, 1869.7999999999874, 5270.479999999977, 0.4569469349061624, 84.26939532313415, 3.265609436555084], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 185.2307692307692, 86, 905, 106.0, 465.80000000000007, 764.9999999999994, 905.0, 0.007544478326890059, 1.5356085140453524, 0.05536537409803586], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, 100.0, 0.06819288845591817], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20530, 14, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 712, 14, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
