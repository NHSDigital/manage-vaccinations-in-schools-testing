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

    var data = {"OkPercent": 98.36917986291657, "KoPercent": 1.6308201370834319};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.38558487593540763, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.44623655913978494, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4928571428571429, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.4336283185840708, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.5942307692307692, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.46568627450980393, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4423076923076923, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.28296703296703296, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.6081081081081081, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6857142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5596153846153846, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5540540540540541, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.015444015444015444, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.3908256880733945, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6081081081081081, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.5675675675675675, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.4382716049382716, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.4594594594594595, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.4864864864864865, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.6216216216216216, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4797297297297297, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.42226487523992323, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.581081081081081, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.5615384615384615, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4231, 69, 1.6308201370834319, 1093.9250768139896, 0, 6144, 1023.0, 2006.6000000000004, 2365.3999999999996, 3223.800000000003, 2.667098680760076, 55.34188456055752, 3.3474490993341397], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 5, 2, 40.0, 7317.6, 1405, 11606, 9683.0, 11606.0, 11606.0, 11606.0, 0.005486312199692986, 0.8839402629068237, 0.07122454796902208], "isController": true}, {"data": ["2.0 Register attendance", 190, 0, 0.0, 6080.642105263158, 3509, 9790, 5796.5, 7519.7, 8205.45, 9599.810000000001, 0.13752629285572623, 24.618963670167794, 0.5756849487967897], "isController": true}, {"data": ["2.5 Select patient", 186, 0, 0.0, 995.1129032258063, 126, 3567, 837.0, 1565.1000000000006, 1848.1500000000005, 2765.729999999996, 0.1350974444793083, 3.759608584434813, 0.0936710796682704], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 912.8999999999999, 727, 1568, 824.0, 1142.0, 1230.6, 1568.0, 0.07784879317688691, 1.14712933617778, 0.11479656025107349], "isController": false}, {"data": ["2.5 Select menacwy", 113, 0, 0.0, 1091.9911504424772, 131, 2671, 1020.0, 1680.4, 1873.0999999999997, 2607.16, 0.09380411376695737, 2.3476215922854005, 0.06540638401328865], "isController": false}, {"data": ["2.3 Search by first/last name", 260, 0, 0.0, 809.7461538461536, 116, 3380, 816.0, 1403.8000000000004, 1731.9999999999998, 2325.2499999999977, 0.1720522324108025, 4.050208036377797, 0.13432210324424335], "isController": false}, {"data": ["2.5 Select td_ipv", 102, 0, 0.0, 1023.3823529411759, 126, 2954, 966.5, 1459.6000000000001, 1862.5499999999981, 2925.259999999999, 0.091537616575847, 2.278365387204118, 0.06373664122908096], "isController": false}, {"data": ["4.0 Vaccination for flu", 180, 21, 11.666666666666666, 4139.155555555555, 126, 8009, 4125.0, 5416.7, 5881.099999999999, 7097.749999999997, 0.13392089887707326, 6.854329100006919, 0.7605416672556706], "isController": true}, {"data": ["5.8 Consent confirm", 37, 11, 29.72972972972973, 1595.8918918918914, 116, 3441, 1835.0, 2903.0000000000005, 3218.7000000000003, 3441.0, 0.027703651790554402, 2.080640182724302, 0.04914751253964617], "isController": false}, {"data": ["4.0 Vaccination for hpv", 156, 14, 8.974358974358974, 4341.596153846154, 123, 7740, 4364.5, 5586.300000000001, 6433.600000000001, 7630.560000000001, 0.12547505580020513, 6.386958712875268, 0.731128785365265], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 128.10000000000005, 112, 251, 123.0, 139.9, 149.50000000000003, 251.0, 0.07901239027154301, 0.46959903046153395, 0.047608051560099646], "isController": false}, {"data": ["5.9 Patient home page", 26, 0, 0.0, 934.2307692307693, 677, 1674, 839.0, 1569.6000000000001, 1655.1, 1674.0, 0.021265823613079788, 0.5529529487518189, 0.015864700593561855], "isController": false}, {"data": ["2.4 Patient attending session", 182, 0, 0.0, 1637.258241758242, 1104, 3725, 1442.0, 2326.6000000000004, 2830.0, 3407.939999999995, 0.13207441740305412, 4.197575119139107, 0.1963059211791488], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 203.0, 203, 203, 203.0, 203.0, 203.0, 203.0, 4.926108374384237, 23.355718903940886, 3.598368226600985], "isController": false}, {"data": ["5.4 Consent route", 37, 0, 0.0, 763.4324324324324, 114, 1819, 835.0, 1478.0000000000002, 1594.0000000000005, 1819.0, 0.02765809215975314, 0.2807440893442341, 0.03752106943937795], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 372.6857142857143, 340, 587, 359.5, 417.0, 439.1, 587.0, 0.07888212756366915, 0.43685600138043723, 0.042753496872887084], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 545.1857142857142, 459, 759, 532.0, 653.9, 697.5500000000001, 759.0, 0.07789782698447496, 0.8357280539564862, 0.12255214772655192], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 99, 14, 14.141414141414142, 4284.141414141413, 125, 7711, 4429.0, 6027.0, 6421.0, 7711.0, 0.09460367272480556, 5.015789190228396, 0.5323761584769191], "isController": true}, {"data": ["2.1 Open session", 260, 0, 0.0, 949.7730769230769, 116, 2729, 1064.0, 1620.2, 1896.2999999999993, 2452.6099999999974, 0.17126378179413304, 2.4427828443999378, 0.11050708035762513], "isController": false}, {"data": ["5.6 Consent questions", 37, 0, 0.0, 894.1081081081081, 115, 1881, 970.0, 1684.0, 1768.5000000000002, 1881.0, 0.027648171783322024, 0.2838316013372748, 0.06260974035751328], "isController": false}, {"data": ["4.3 Vaccination confirm", 518, 31, 5.984555984555985, 2113.6177606177603, 117, 6144, 2037.5, 2962.5, 3464.2999999999997, 4970.739999999992, 0.3980071979371241, 8.127588031239723, 0.8937596368357199], "isController": false}, {"data": ["4.1 Vaccination questions", 545, 24, 4.4036697247706424, 1182.078899082569, 122, 3191, 1094.0, 1739.2, 2006.699999999998, 2569.859999999996, 0.4045493617027594, 4.723171789473996, 0.8391028493914686], "isController": false}, {"data": ["5.3 Consent parent details", 37, 0, 0.0, 783.7027027027025, 113, 2687, 843.0, 1292.4000000000017, 1968.800000000001, 2687.0, 0.02766551642920432, 0.2659994716914473, 0.0445906379798939], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 37, 0, 0.0, 856.2432432432437, 113, 1840, 942.0, 1535.4, 1610.5000000000005, 1840.0, 0.027661007623224182, 0.4952976170228831, 0.03821056315942534], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2769.3285714285716, 2367, 3899, 2682.0, 3169.7, 3392.4, 3899.0, 0.07856764449712218, 4.697715985962207, 0.3763420861898284], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 110, 9, 8.181818181818182, 4408.118181818183, 122, 9028, 4360.0, 6189.100000000001, 6373.999999999998, 8908.650000000001, 0.09182061923825614, 4.806721378886934, 0.5376535817241074], "isController": true}, {"data": ["5.0 Consent for td_ipv", 7, 3, 42.857142857142854, 6419.571428571428, 1179, 11124, 9236.0, 11124.0, 11124.0, 11124.0, 0.006281694514016704, 0.9670330432274808, 0.07734686911371573], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 162, 0, 0.0, 1148.1913580246912, 121, 3151, 1085.0, 1637.8000000000004, 2061.4999999999995, 2871.910000000002, 0.12862492020491062, 3.013070235905646, 0.09584063878549491], "isController": false}, {"data": ["2.5 Select flu", 185, 0, 0.0, 1017.2324324324323, 123, 2332, 936.0, 1475.6000000000001, 1797.1, 2221.059999999998, 0.13582866498777543, 3.142780907216173, 0.09417807826300835], "isController": false}, {"data": ["5.1 Consent start", 37, 0, 0.0, 1120.3513513513515, 114, 2541, 1080.0, 2071.0, 2325.0000000000005, 2541.0, 0.027714255538918677, 0.30587283449608366, 0.050385698638930436], "isController": false}, {"data": ["5.5 Consent agree", 37, 0, 0.0, 833.1621621621623, 114, 1840, 913.0, 1305.2000000000007, 1836.4, 1840.0, 0.027654019810741868, 0.3736708553164106, 0.03696228930626528], "isController": false}, {"data": ["Debug Sampler", 260, 0, 0.0, 0.2730769230769231, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.17117459347679959, 0.7007125595078599, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 74, 0, 0.0, 837.9324324324327, 641, 2596, 755.0, 1107.5, 1329.0, 2596.0, 0.0542777465639986, 1.2400662899069796, 0.032591288385002325], "isController": false}, {"data": ["4.2 Vaccination batch", 521, 3, 0.5758157389635317, 1136.73320537428, 162, 2573, 1011.0, 1715.0000000000002, 1918.6999999999998, 2392.8399999999992, 0.39934724737837346, 8.600058516396233, 0.6429449962403105], "isController": false}, {"data": ["5.0 Consent for hpv", 12, 4, 33.333333333333336, 8301.166666666668, 1158, 14708, 10293.0, 14417.000000000002, 14708.0, 14708.0, 0.010615082085545178, 1.8213590738385108, 0.14249762902189977], "isController": true}, {"data": ["5.7 Consent triage", 37, 0, 0.0, 934.6216216216218, 113, 2386, 1018.0, 1752.8, 1979.2000000000007, 2386.0, 0.02766028386927002, 0.36517006308787453, 0.04011792438724996], "isController": false}, {"data": ["5.0 Consent for flu", 13, 2, 15.384615384615385, 10082.615384615383, 1171, 16237, 10956.0, 14939.8, 16237.0, 16237.0, 0.00972315194668721, 2.0068251092452214, 0.14058105883254862], "isController": true}, {"data": ["2.2 Session register", 260, 0, 0.0, 934.392307692307, 116, 2954, 1016.0, 1647.8000000000002, 2035.499999999999, 2418.419999999999, 0.17146064022084131, 8.855893766820454, 0.1121410805350627], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 3, 4.3478260869565215, 0.07090522335145355], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 24, 34.78260869565217, 0.5672417868116284], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 31, 44.927536231884055, 0.7326873079650201], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 11, 15.942028985507246, 0.2599858189553297], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4231, 69, "Test failed: text expected to contain /Vaccination outcome recorded for/", 31, "Test failed: text expected to contain /Which batch did you use?/", 24, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 11, "Test failed: text expected to contain /Check and confirm/", 3, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.8 Consent confirm", 37, 11, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 518, 31, "Test failed: text expected to contain /Vaccination outcome recorded for/", 31, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 545, 24, "Test failed: text expected to contain /Which batch did you use?/", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 521, 3, "Test failed: text expected to contain /Check and confirm/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
