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

    var data = {"OkPercent": 99.9576311081819, "KoPercent": 0.04236889181809622};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8115613326217885, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9629629629629629, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.42524213075060535, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9914841849148418, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.991238670694864, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.47862232779097386, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.47754137115839246, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.18518518518518517, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9772727272727273, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.8381706244503079, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9834905660377359, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9766686355581807, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4652061855670103, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9028950542822678, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3888888888888889, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5625782227784731, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9839901477832512, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.2037037037037037, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.45451860602480804, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.47551546391752575, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5370370370370371, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.9629629629629629, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5048076923076923, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9861111111111112, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9849124924562462, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9629629629629629, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21242, 9, 0.04236889181809622, 272.8464833819816, 0, 9142, 132.0, 632.0, 762.0, 1131.9900000000016, 5.458994195353456, 2284.9214712738003, 41.54913170066031], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 134.44444444444443, 92, 512, 102.0, 207.99999999999972, 510.4, 512.0, 0.007865281134278411, 3.5680824538358977, 0.05846986499463413], "isController": false}, {"data": ["2.0 Register attendance", 1652, 9, 0.5447941888619855, 1144.2300242130764, 518, 3579, 1107.0, 1620.8000000000002, 1801.35, 2439.1100000000006, 0.46228035736622203, 982.4999275500764, 16.242935378218508], "isController": true}, {"data": ["2.5 Select patient", 1644, 0, 0.0, 134.99513381995135, 73, 1463, 105.0, 206.5, 335.0, 574.55, 0.4638947918215687, 208.32279110491612, 3.345648734221863], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 1125.851851851852, 375, 6204, 671.0, 3175.199999999998, 5816.799999999997, 6204.0, 0.007870143793356842, 3.620278669767892, 0.058088139944710786], "isController": false}, {"data": ["2.3 Search by first/last name", 1655, 0, 0.0, 137.3577039274927, 79, 2027, 108.0, 202.4000000000001, 308.7999999999993, 571.7600000000002, 0.4634451024773731, 209.76715426601567, 3.465874330139809], "isController": false}, {"data": ["4.0 Vaccination for flu", 421, 0, 0.0, 987.5035629453681, 226, 2164, 915.0, 1322.8, 1523.2999999999997, 1946.859999999999, 0.12036938820614444, 158.56003660901993, 3.413552035779443], "isController": true}, {"data": ["4.0 Vaccination for hpv", 423, 0, 0.0, 995.6548463356971, 375, 4438, 925.0, 1378.6, 1507.5999999999995, 1810.3599999999997, 0.12135159861366557, 159.92186669607577, 3.4561655406859204], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2831.5555555555543, 760, 9142, 2035.0, 6491.0, 8187.199999999995, 9142.0, 0.007861701604165654, 4.3669625475087, 0.057966684892954194], "isController": false}, {"data": ["1.2 Sign-in page", 1694, 0, 0.0, 163.59031877213692, 16, 7978, 110.0, 279.0, 481.25, 841.9999999999991, 0.47141772619702255, 210.56257982915838, 3.9992157053692083], "isController": false}, {"data": ["2.4 Patient attending session", 1137, 9, 0.7915567282321899, 490.9454705364993, 98, 1745, 434.0, 706.0, 853.0, 1158.7199999999993, 0.3200443164267178, 145.30616436017314, 2.805697156077619], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.1 Homepage", 1696, 0, 0.0, 159.06898584905633, 27, 8125, 113.0, 246.5999999999999, 398.14999999999986, 762.4199999999996, 0.4714083602716157, 210.345252911645, 3.9906776938166564], "isController": false}, {"data": ["1.3 Sign-in", 1693, 0, 0.0, 177.01890135853543, 73, 7809, 115.0, 339.2000000000003, 456.2999999999995, 860.2399999999998, 0.4711456018015406, 210.6492140018879, 4.157810365425871], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 10528.777777777777, 5528, 18668, 9290.0, 16465.399999999998, 18517.2, 18668.0, 0.007835603239876835, 31.683255748920427, 0.4644023284800961], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 388, 0, 0.0, 1052.7706185567008, 252, 2893, 974.5, 1421.7000000000003, 1679.0, 2180.370000000001, 0.11227982447306616, 148.23029388475388, 3.1887380283988374], "isController": true}, {"data": ["2.1 Open session", 1658, 0, 0.0, 379.9324487334141, 134, 2506, 327.0, 608.1000000000001, 715.0999999999999, 1086.4600000000005, 0.4632923262807462, 207.0201847435783, 3.3446174244160085], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1547.0740740740741, 430, 8246, 1045.0, 3838.7999999999997, 6594.799999999991, 8246.0, 0.00786627564478696, 4.369808588112048, 0.05799272875712262], "isController": false}, {"data": ["4.3 Vaccination confirm", 1598, 0, 0.0, 670.1376720901119, 428, 2063, 599.0, 954.1000000000001, 1114.2999999999997, 1552.06, 0.46202410505236946, 206.23536556988708, 4.762444405496699], "isController": false}, {"data": ["4.1 Vaccination questions", 1624, 0, 0.0, 178.80172413793136, 96, 2444, 131.0, 316.5, 436.5, 718.0, 0.46318968273503236, 202.88905367525967, 4.343154472636157], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 2539.1111111111118, 696, 7665, 1642.0, 6102.399999999999, 7526.999999999999, 7665.0, 0.007880963590823874, 4.3793150442012605, 0.05814405505714137], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1693, 0, 0.0, 1156.323095097462, 391, 23912, 1061.0, 1481.0, 1657.5999999999995, 2365.9599999999964, 0.4713304157061883, 865.9361498166217, 15.488352318006744], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 388, 0, 0.0, 994.9097938144329, 291, 2363, 917.5, 1362.2, 1527.999999999999, 1904.5600000000013, 0.11185756495883037, 147.45526933907027, 3.1769756252311745], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 966.1111111111111, 107, 4042, 669.0, 1910.7999999999988, 3657.999999999998, 4042.0, 0.007867600521709333, 4.3273214302365295, 0.05674586553950177], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2044.851851851852, 1760, 3533, 1920.0, 2395.7999999999997, 3109.799999999998, 3533.0, 0.007863847098852053, 4.372254900724027, 0.05865119294560489], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 151.70370370370367, 96, 652, 105.0, 278.7999999999997, 611.1999999999998, 652.0, 0.007867653250958033, 3.568712935066655, 0.058625797710833434], "isController": false}, {"data": ["Debug Sampler", 1655, 0, 0.0, 0.2833836858006046, 0, 10, 0.0, 1.0, 1.0, 1.0, 0.4634649592486883, 2.6409615634227293, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1664, 0, 0.0, 668.182692307692, 481, 2444, 627.5, 843.0, 935.75, 1194.0499999999997, 0.46409549210995826, 234.79478605387817, 3.3467109380425546], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1620, 0, 0.0, 167.64567901234585, 95, 1523, 128.0, 280.9000000000001, 393.9499999999998, 704.4299999999994, 0.46318348870947357, 203.80733566492847, 4.106777167409238], "isController": false}, {"data": ["2.2 Session register", 1657, 0, 0.0, 154.6047073023535, 75, 1476, 107.0, 314.20000000000005, 390.0999999999999, 745.6800000000003, 0.46358273636914277, 213.59942981526635, 3.3507844597316705], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 154.1851851851852, 92, 599, 110.0, 391.1999999999999, 580.1999999999999, 599.0, 0.007865764609128308, 3.567856544731292, 0.05836591935712231], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, 100.0, 0.04236889181809622], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21242, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1137, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
