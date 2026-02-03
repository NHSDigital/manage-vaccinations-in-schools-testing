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

    var data = {"OkPercent": 99.97560975609755, "KoPercent": 0.024390243902439025};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6206794856670992, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.053582363747703615, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8913846153846153, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9056950398040416, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.18908629441624367, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.17865429234338748, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.12, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.8425149700598802, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.36186186186186187, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.897489539748954, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8290341931613677, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.17095115681233933, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.3061660561660562, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.18, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.33460076045627374, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8324004975124378, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.22, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.1775644871025795, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.18877551020408162, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.34615384615384615, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.96, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4405125076266016, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8567870485678705, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8843329253365974, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.84, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20500, 5, 0.024390243902439025, 688.9787317073152, 0, 14670, 254.0, 1770.9000000000015, 2554.9500000000007, 5171.980000000003, 4.9862100887326495, 758.4579256086795, 37.39626664018402], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 25, 0, 0.0, 144.96, 85, 367, 111.0, 280.20000000000005, 342.3999999999999, 367.0, 0.0072603904173301455, 1.3020560123329348, 0.05336018265036777], "isController": false}, {"data": ["2.0 Register attendance", 1633, 5, 0.3061849357011635, 3394.592774035517, 863, 19249, 2804.0, 6046.400000000001, 7823.0, 12088.42000000002, 0.457359425693237, 340.87731422022665, 14.774008179640868], "isController": true}, {"data": ["2.5 Select patient", 1625, 0, 0.0, 388.7310769230771, 68, 11171, 140.0, 889.4000000000037, 1523.199999999999, 3763.66, 0.45660624946436573, 71.34489743174791, 3.2549692370320313], "isController": false}, {"data": ["7.1 Full name search", 25, 0, 0.0, 1908.5600000000004, 357, 8566, 1216.0, 5092.4, 7529.499999999998, 8566.0, 0.007257306946926443, 1.3366839616455681, 0.052948574414538534], "isController": false}, {"data": ["2.3 Search by first/last name", 1633, 0, 0.0, 338.1316595223516, 78, 10480, 147.0, 756.2000000000003, 1284.7999999999988, 3114.0600000000113, 0.4576818094042541, 74.07059471711732, 3.3845129583614653], "isController": false}, {"data": ["4.0 Vaccination for flu", 394, 0, 0.0, 2575.2081218274125, 227, 16204, 1889.5, 4936.5, 6178.5, 11795.900000000036, 0.1120893482971665, 49.42714690663982, 3.1391879750817413], "isController": true}, {"data": ["4.0 Vaccination for hpv", 431, 0, 0.0, 2588.348027842227, 219, 14735, 1908.0, 4983.400000000001, 6524.199999999999, 11635.080000000002, 0.12314598856942363, 53.57230618462512, 3.450997631171907], "isController": true}, {"data": ["7.6 First name search", 25, 0, 0.0, 3020.1200000000003, 729, 10122, 2707.0, 6108.200000000003, 9126.299999999997, 10122.0, 0.007261562949763055, 2.0830559189362683, 0.05292544771166367], "isController": false}, {"data": ["1.2 Sign-in page", 1670, 0, 0.0, 503.49760479041936, 16, 11806, 171.0, 1269.2000000000007, 1990.1499999999987, 5217.719999999987, 0.4643604727467673, 73.70782476853577, 3.8933622915904316], "isController": false}, {"data": ["2.4 Patient attending session", 666, 5, 0.7507507507507507, 1494.5165165165165, 432, 10017, 940.0, 3291.1000000000004, 4241.999999999996, 8438.540000000006, 0.20224264623266894, 47.20405709832212, 1.752834248676161], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 12.056790865384617, 22.686298076923077], "isController": false}, {"data": ["1.1 Homepage", 1673, 0, 0.0, 367.16138673042417, 30, 9638, 158.0, 787.6000000000001, 1446.1999999999994, 3590.0599999999977, 0.464777220860024, 74.43946513705511, 3.888511084488748], "isController": false}, {"data": ["1.3 Sign-in", 1667, 0, 0.0, 507.3461307738448, 74, 8217, 193.0, 1297.0000000000005, 2025.1999999999998, 4039.2799999999966, 0.4644131901146574, 74.16212232736059, 4.0522146264350285], "isController": false}, {"data": ["Run some searches", 25, 0, 0.0, 12846.640000000001, 6683, 24737, 11645.0, 19883.0, 23389.699999999997, 24737.0, 0.007274566283083636, 13.469787264493192, 0.42620064124938056], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 389, 0, 0.0, 2697.791773778921, 258, 13591, 1995.0, 5348.0, 6937.5, 12811.2, 0.11204336567901448, 48.31854618332484, 3.1408711412185655], "isController": true}, {"data": ["2.1 Open session", 1638, 0, 0.0, 1674.7661782661762, 140, 11409, 1443.0, 2977.2000000000003, 3763.8499999999995, 6077.149999999999, 0.45723307553724885, 71.47311705520893, 3.2625316066201653], "isController": false}, {"data": ["7.7 Partial name search", 25, 0, 0.0, 2595.8399999999997, 518, 6915, 2049.0, 6142.200000000002, 6815.099999999999, 6915.0, 0.007272299925938897, 1.9155149941916139, 0.05299660163606386], "isController": false}, {"data": ["4.3 Vaccination confirm", 1578, 0, 0.0, 1634.0506970849178, 547, 14670, 1067.5, 3231.1000000000004, 4376.199999999999, 9336.860000000002, 0.4551581270675731, 67.39114035643092, 4.638479135755526], "isController": false}, {"data": ["4.1 Vaccination questions", 1608, 0, 0.0, 537.1069651741279, 84, 10390, 187.0, 1422.6000000000008, 2166.3499999999995, 4945.560000000001, 0.45720550762037615, 64.76398071818228, 4.241411087638733], "isController": false}, {"data": ["7.7 Last name search", 25, 0, 0.0, 2019.9999999999993, 777, 5201, 1636.0, 3895.000000000002, 4943.299999999999, 5201.0, 0.007263563033345274, 2.030197929641206, 0.05294910464963913], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1667, 0, 0.0, 2422.769046190766, 495, 21423, 1858.0, 4360.6, 5895.5999999999985, 9654.71999999998, 0.46451451823825557, 321.366094810231, 15.08880744500853], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 392, 0, 0.0, 2498.102040816325, 274, 13845, 1813.0, 4925.5, 6867.299999999998, 10103.469999999988, 0.11261639780938122, 47.43767715042377, 3.171991131171386], "isController": true}, {"data": ["7.0 Open Children Search", 26, 0, 0.0, 1960.9230769230771, 409, 6179, 1008.5, 5089.8, 5916.8499999999985, 6179.0, 0.007275892031359095, 1.9923630024738033, 0.05186177353016486], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 25, 0, 0.0, 2490.9599999999996, 1908, 4209, 2231.0, 3825.8, 4098.9, 4209.0, 0.007254546061289308, 2.019342852839357, 0.05349434254225411], "isController": false}, {"data": ["7.2 No Consent search", 25, 0, 0.0, 202.95999999999998, 88, 1164, 110.0, 490.20000000000084, 1029.8999999999996, 1164.0, 0.007258921068815152, 1.3499965601787784, 0.05347698190684888], "isController": false}, {"data": ["Debug Sampler", 1633, 0, 0.0, 0.2780159216166566, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.4577101598762248, 2.5577555687076763, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1639, 0, 0.0, 1061.4948139109192, 442, 10622, 812.0, 1809.0, 2525.0, 4588.799999999996, 0.4573749690595182, 98.85571554023895, 3.260018892966304], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1606, 0, 0.0, 446.410958904109, 85, 9747, 180.0, 1128.0999999999997, 1695.299999999997, 3598.440000000007, 0.4574697026019658, 66.29184974979455, 4.010316078877918], "isController": false}, {"data": ["2.2 Session register", 1634, 0, 0.0, 385.009791921665, 73, 7783, 157.0, 924.5, 1504.5, 3372.7000000000035, 0.45750213911648885, 77.95910866389775, 3.26846661781324], "isController": false}, {"data": ["7.3 Due vaccination", 25, 0, 0.0, 463.24000000000007, 80, 3107, 124.0, 2061.600000000003, 3041.6, 3107.0, 0.007259941328058163, 1.4084955452274017, 0.0532576250619273], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.024390243902439025], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20500, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 666, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
