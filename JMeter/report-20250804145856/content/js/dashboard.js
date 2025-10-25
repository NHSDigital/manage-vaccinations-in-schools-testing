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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.23853760863050644, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.33826429980276135, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.33430232558139533, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.29853479853479853, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.30952380952380953, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.33695652173913043, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.07515030060120241, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.34574468085106386, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7928571428571428, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.13471971066907776, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.006815365551425031, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.30319148936170215, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.2871951219512195, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3351063829787234, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.2978723404255319, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.31808943089430897, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [1.0, 500, 1500, "Select Teams"], "isController": true}, {"data": [0.3346534653465347, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.23404255319148937, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.26063829787234044, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.46190476190476193, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.30696395846059865, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.3064516129032258, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.26272727272727275, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.4785714285714286, 500, 1500, "1.4 Select Team"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11004, 0, 0.0, 1669.721283169751, 0, 12701, 1477.0, 2912.5, 3504.0, 4907.850000000002, 3.055111954138894, 69.74992224876813, 4.205539697836406], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 22, 0, 0.0, 14850.636363636364, 11127, 19792, 14772.0, 18325.6, 19619.649999999998, 19792.0, 0.008468942271455006, 1.9908472808632316, 0.13536999726106708], "isController": true}, {"data": ["2.0 Register attendance", 542, 0, 0.0, 8742.053505535048, 4126, 16735, 8648.5, 11499.9, 12736.700000000003, 14433.970000000016, 0.15512422244699017, 26.944716438037318, 0.6438716769035774], "isController": true}, {"data": ["2.5 Select patient", 507, 0, 0.0, 1377.8284023668637, 670, 7045, 1147.0, 2256.9999999999995, 2591.2, 3763.6800000000003, 0.1454600122679884, 4.135475431800342, 0.10085606319362478], "isController": false}, {"data": ["2.5 Select menacwy", 344, 0, 0.0, 1391.3982558139537, 680, 4619, 1251.0, 2184.5, 2521.25, 3532.6000000000004, 0.10580012265432824, 2.634808583473221, 0.07377078864764683], "isController": false}, {"data": ["2.3 Search by first/last name", 546, 0, 0.0, 1541.9377289377287, 782, 6383, 1344.0, 2487.2000000000003, 2920.95, 3524.119999999997, 0.1555319377427872, 5.906910238505805, 0.1214258721538866], "isController": false}, {"data": ["2.5 Select td_ipv", 336, 0, 0.0, 1456.7589285714284, 680, 4590, 1305.5, 2296.2, 2726.75, 3526.68, 0.10662076896421731, 2.6921830931668778, 0.07423887526512396], "isController": false}, {"data": ["4.0 Vaccination for flu", 491, 0, 0.0, 5766.382892057026, 3229, 15475, 5563.0, 7758.4, 8569.599999999999, 10530.119999999999, 0.14328031378096906, 7.8269233836426695, 0.8609451719531558], "isController": true}, {"data": ["4.0 Vaccination for hpv", 479, 0, 0.0, 5788.979123173275, 1968, 11973, 5577.0, 7695.0, 8741.0, 11247.799999999996, 0.14382674012339675, 7.604915709535742, 0.864088192327579], "isController": true}, {"data": ["5.8 Consent confirm", 92, 0, 0.0, 3295.61956521739, 1692, 7856, 3089.0, 4960.6, 5587.999999999999, 7856.0, 0.028637847031562642, 2.9516434461781236, 0.06324079758193848], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 110.15714285714286, 101, 186, 107.0, 118.9, 125.70000000000002, 186.0, 0.07889830909652419, 0.46892100504047485, 0.04753931319585491], "isController": false}, {"data": ["5.9 Patient home page", 92, 0, 0.0, 1410.3152173913047, 714, 4102, 1221.0, 2355.2000000000003, 2863.2, 4102.0, 0.0286335954863494, 0.7564116446219105, 0.021383102743409682], "isController": false}, {"data": ["2.4 Patient attending session", 499, 0, 0.0, 2354.611222444891, 1230, 5724, 2139.0, 3592.0, 4279.0, 5224.0, 0.14248980227041366, 5.6099341885933915, 0.2117866006402047], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 113.0, 113, 113, 113.0, 113.0, 113.0, 113.0, 8.849557522123893, 41.88848174778761, 6.464325221238938], "isController": false}, {"data": ["5.4 Consent route", 94, 0, 0.0, 1364.1808510638298, 797, 3477, 1206.5, 1988.0, 2456.75, 3477.0, 0.028812225211064878, 0.35005853872133186, 0.045853332191316855], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 331.6714285714285, 297, 450, 316.5, 383.79999999999995, 403.55000000000007, 450.0, 0.07887323943661971, 0.4368067781690141, 0.04274867957746479], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 518.8285714285713, 439, 847, 487.5, 623.9, 705.2, 847.0, 0.07924208343285762, 0.8376135850363777, 0.12404790990514722], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 327, 0, 0.0, 5924.042813455659, 2934, 15491, 5701.0, 7671.4, 8588.199999999999, 11132.48, 0.10590016108483219, 6.178325356141918, 0.6414801812463445], "isController": true}, {"data": ["2.1 Open session", 553, 0, 0.0, 2051.6817359855336, 899, 5156, 1931.0, 3133.4000000000015, 3555.2999999999993, 4516.960000000001, 0.156387289587689, 2.7687533489468463, 0.10206273429813639], "isController": false}, {"data": ["4.3 Vaccination confirm", 1614, 0, 0.0, 2845.6833952912025, 1412, 12701, 2593.0, 4289.0, 4865.25, 6388.999999999982, 0.47587106665585593, 10.229094665154385, 1.1075363412804882], "isController": false}, {"data": ["5.6 Consent questions", 94, 0, 0.0, 1525.0744680851064, 841, 3243, 1332.5, 2438.0, 2719.25, 3243.0, 0.028782943839883546, 0.36119819567686307, 0.0719474917769579], "isController": false}, {"data": ["4.1 Vaccination questions", 1640, 0, 0.0, 1559.3774390243893, 784, 8200, 1392.0, 2359.9, 2714.7999999999993, 3725.18, 0.4769828161123632, 5.710606440933095, 1.0069368666162635], "isController": false}, {"data": ["5.3 Consent parent details", 94, 0, 0.0, 1413.0638297872342, 792, 6224, 1199.0, 2107.0, 2432.0, 6224.0, 0.028820378828549712, 0.3359809557274524, 0.05324386537924399], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 94, 0, 0.0, 1531.563829787234, 802, 7753, 1317.5, 2369.0, 3070.25, 7753.0, 0.028813196689302396, 0.6150819454785351, 0.04588301614167388], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2814.2, 2291, 4310, 2665.5, 3781.3999999999996, 4081.55, 4310.0, 0.07854983538198786, 4.680005328764725, 0.3738020974769793], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 338, 0, 0.0, 6029.736686390531, 3279, 13085, 5649.0, 8036.700000000001, 9092.2, 11824.620000000003, 0.10482355838144983, 5.720462100352431, 0.6345170070408558], "isController": true}, {"data": ["5.0 Consent for td_ipv", 23, 0, 0.0, 15276.608695652174, 12453, 18361, 14856.0, 17896.4, 18283.199999999997, 18361.0, 0.008792055651418695, 2.0689343512495038, 0.14084573017162091], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 492, 0, 0.0, 1437.3760162601618, 688, 4612, 1294.5, 2226.9, 2731.1499999999996, 3128.4699999999984, 0.14575514794147518, 3.4796281582874244, 0.1086046658977984], "isController": false}, {"data": ["Select Teams", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select flu", 505, 0, 0.0, 1376.394059405941, 681, 6717, 1182.0, 2226.2000000000003, 2542.3999999999996, 3298.08, 0.14535243504185286, 3.4110555709702695, 0.1007814735153472], "isController": false}, {"data": ["5.1 Consent start", 94, 0, 0.0, 1609.351063829787, 959, 3106, 1532.5, 2256.5, 2615.25, 3106.0, 0.028828554744812086, 0.37656281339552533, 0.06236882432553449], "isController": false}, {"data": ["5.5 Consent agree", 94, 0, 0.0, 1589.659574468085, 797, 3957, 1486.0, 2451.5, 3009.25, 3957.0, 0.028820537883217343, 0.4991447926960172, 0.04533180535298567], "isController": false}, {"data": ["Debug Sampler", 554, 0, 0.0, 0.3429602888086647, 0, 10, 0.0, 1.0, 1.0, 1.0, 0.15638633522173126, 0.7631097739448227, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 105, 0, 0.0, 1007.5428571428572, 656, 3330, 875.0, 1396.0, 1885.6999999999987, 3307.379999999999, 0.029694603726927293, 0.6779881202495704, 0.01825947475265809], "isController": false}, {"data": ["4.2 Vaccination batch", 1637, 0, 0.0, 1490.951740989615, 769, 9673, 1324.0, 2336.2000000000003, 2728.6999999999994, 3464.959999999999, 0.47702221577256326, 10.329149551910186, 0.772241975820481], "isController": false}, {"data": ["5.0 Consent for hpv", 23, 0, 0.0, 15480.217391304348, 9288, 24191, 14757.0, 19710.2, 23369.79999999999, 24191.0, 0.007796018200651882, 1.8104243022097644, 0.12467604684423962], "isController": true}, {"data": ["5.7 Consent triage", 93, 0, 0.0, 1515.2258064516127, 794, 3375, 1369.0, 2357.6000000000004, 2643.7999999999997, 3375.0, 0.02863904487245617, 0.4803472614105807, 0.04826643800339665], "isController": false}, {"data": ["5.0 Consent for flu", 24, 0, 0.0, 15325.083333333332, 9678, 18809, 15419.5, 18470.0, 18725.0, 18809.0, 0.007456368593154121, 1.7508788903214783, 0.11662347862896023], "isController": true}, {"data": ["2.2 Session register", 550, 0, 0.0, 1637.441818181819, 797, 5132, 1464.5, 2532.8, 2948.7999999999997, 3904.500000000005, 0.15579628757275332, 7.58800839338336, 0.10304076555038154], "isController": false}, {"data": ["1.4 Select Team", 70, 0, 0.0, 933.6714285714285, 742, 1881, 847.5, 1205.5, 1613.3000000000009, 1881.0, 0.07915722434062032, 1.163317450294917, 0.11487073766617363], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11004, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
