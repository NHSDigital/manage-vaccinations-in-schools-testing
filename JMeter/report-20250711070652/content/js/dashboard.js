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

    var data = {"OkPercent": 99.99184206232664, "KoPercent": 0.008157937673356175};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.582425068119891, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8808630393996247, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8421052631578947, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.47540983606557374, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8425414364640884, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0038240917782026767, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.027450980392156862, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3472222222222222, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [0.9928571428571429, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9027777777777778, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.4110486891385768, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.8783783783783784, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7142857142857143, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.01971830985915493, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.01358695652173913, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.41594703511801956, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8108108108108109, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.6982416335791265, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.8026315789473685, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.8421052631578947, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.34285714285714286, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.034759358288770054, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.8082851637764933, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.85, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.525, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.8783783783783784, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9878048780487805, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8229284903518729, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5945945945945946, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.46648550724637683, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12258, 1, 0.008157937673356175, 862.0222711698499, 0, 25487, 503.0, 1676.1000000000004, 2858.199999999997, 8294.599999999991, 3.402652170002698, 79.70788729995054, 4.2399262846309655], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 7, 0, 0.0, 10228.57142857143, 4722, 25588, 7142.0, 25588.0, 25588.0, 25588.0, 0.0035282062448242476, 0.7917510404113183, 0.056590104906172396], "isController": true}, {"data": ["2.0 Register attendance", 548, 0, 0.0, 7337.766423357669, 3240, 32346, 6077.0, 11351.1, 16428.499999999978, 25588.289999999994, 0.15607999954429197, 38.3872277055528, 0.673245751056673], "isController": true}, {"data": ["2.5 Select patient", 533, 0, 0.0, 489.46716697936245, 186, 14583, 265.0, 637.6000000000001, 978.1999999999985, 5414.619999999979, 0.1524785342836398, 4.318140284328124, 0.10572242123182057], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 305.7428571428572, 247, 1303, 267.5, 364.29999999999995, 503.20000000000016, 1303.0, 0.07961520832456617, 1.1437688766237237, 0.11506885578159956], "isController": false}, {"data": ["2.5 Select menacwy", 380, 0, 0.0, 458.9236842105263, 185, 5523, 318.5, 623.2000000000003, 773.3999999999999, 3529.27, 0.11564334982265484, 2.9020088205633656, 0.08063413259118705], "isController": false}, {"data": ["2.3 Search by first/last name", 549, 0, 0.0, 987.0127504553732, 448, 16242, 775.0, 1371.0, 1823.0, 4836.0, 0.15618203485561982, 11.002680362601913, 0.13472011802411804], "isController": false}, {"data": ["2.5 Select td_ipv", 362, 0, 0.0, 510.25414364640903, 188, 13019, 314.0, 645.4, 1170.4999999999964, 4301.810000000002, 0.11337918195354209, 2.8842624816346083, 0.07894468430944875], "isController": false}, {"data": ["4.0 Vaccination for flu", 523, 0, 0.0, 3065.441682600384, 893, 26732, 1935.0, 5450.600000000002, 9279.399999999998, 18458.879999999994, 0.1534502391388478, 8.96469940330449, 0.9337435819730884], "isController": true}, {"data": ["4.0 Vaccination for hpv", 510, 0, 0.0, 3005.74705882353, 601, 30950, 1882.0, 5547.900000000005, 9255.6, 17682.479999999978, 0.15330318771434268, 7.927089612157213, 0.9300135064617293], "isController": true}, {"data": ["5.8 Consent confirm", 36, 0, 0.0, 1861.75, 909, 11661, 1258.0, 3042.4000000000033, 7258.849999999993, 11661.0, 0.01286919393803769, 1.2318999590866875, 0.028425404633374538], "isController": false}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 119.97142857142856, 102, 706, 108.0, 133.8, 142.40000000000003, 706.0, 0.07900454276120877, 0.4761103841595892, 0.04760332312857989], "isController": false}, {"data": ["5.9 Patient home page", 36, 0, 0.0, 509.861111111111, 194, 4575, 261.0, 763.6000000000013, 3273.649999999998, 4575.0, 0.012862512956302113, 0.3307051732044557, 0.009601176459922017], "isController": false}, {"data": ["2.4 Patient attending session", 534, 0, 0.0, 1433.9513108614244, 650, 19847, 996.5, 2166.5, 3212.25, 10954.899999999983, 0.15229820559059903, 9.524360562775382, 0.22636510635633958], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 374.0, 374, 374, 374.0, 374.0, 374.0, 374.0, 2.6737967914438503, 16.76867479946524, 5.653095755347594], "isController": false}, {"data": ["5.4 Consent route", 37, 0, 0.0, 504.4324324324325, 291, 4086, 358.0, 621.2, 1104.3000000000047, 4086.0, 0.012620612120153685, 0.15028514855398484, 0.020092448861791335], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 322.77142857142854, 304, 367, 317.5, 345.8, 356.45, 367.0, 0.07889946517433964, 0.4072106185999853, 0.04276289372242041], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 622.6142857142855, 455, 2944, 504.5, 800.6999999999999, 1507.2500000000014, 2944.0, 0.07950633381529315, 0.7715375382056329, 0.12508271853167702], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 355, 0, 0.0, 2919.892957746478, 623, 21520, 1913.0, 5658.600000000005, 8506.799999999997, 16405.2, 0.11263119154282523, 6.380403012943862, 0.6848842124581203], "isController": true}, {"data": ["2.1 Open session", 552, 0, 0.0, 3404.5072463768124, 1257, 22013, 2631.0, 5796.4, 8387.050000000003, 15836.15000000002, 0.15649425649068435, 2.765253191033418, 0.10213068648955599], "isController": false}, {"data": ["4.3 Vaccination confirm", 1737, 0, 0.0, 1504.5584340817527, 572, 25487, 993.0, 2046.4000000000024, 4197.999999999998, 12641.899999999969, 0.5121508300411106, 10.851571181889025, 1.1920396029032494], "isController": false}, {"data": ["5.6 Consent questions", 37, 0, 0.0, 667.2162162162161, 288, 5015, 387.0, 792.6000000000031, 4490.300000000001, 5015.0, 0.012592632425143607, 0.1544063200252465, 0.031484572344843455], "isController": false}, {"data": ["4.1 Vaccination questions", 1763, 0, 0.0, 789.0419739081125, 284, 21068, 512.0, 891.6000000000001, 2401.3999999999996, 7755.2799999999825, 0.5129298769870214, 6.679107526289474, 1.1078418996392907], "isController": false}, {"data": ["5.3 Consent parent details", 38, 0, 0.0, 1038.0526315789473, 286, 11075, 345.5, 3194.6000000000004, 4664.3999999999805, 11075.0, 0.012790620570616511, 0.14455386631007763, 0.023620507904603513], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 38, 0, 0.0, 513.9473684210527, 303, 2959, 360.0, 717.6000000000003, 1702.1499999999962, 2959.0, 0.012776119683999491, 0.2654518604635916, 0.02035767240869193], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1550.7571428571423, 1289, 3856, 1410.5, 1920.5, 2531.9500000000007, 3856.0, 0.07877941426380075, 3.7084793800510263, 0.37504848099221544], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 374, 0, 0.0, 2843.4385026737964, 596, 22713, 1903.0, 4922.5, 8097.5, 16688.75, 0.11602112080745736, 6.145176255160846, 0.7030217801734795], "isController": true}, {"data": ["5.0 Consent for td_ipv", 7, 0, 0.0, 5495.142857142858, 3888, 8375, 4898.0, 8375.0, 8375.0, 8375.0, 0.0035478894112733676, 0.7973807207499326, 0.05689541572774308], "isController": true}, {"data": ["Calculate site depending on vaccination", 1785, 0, 0.0, 0.19327731092437014, 0, 15, 0.0, 1.0, 1.0, 1.0, 0.5119508251872923, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 519, 0, 0.0, 552.5857418111751, 186, 13344, 372.0, 701.0, 1018.0, 5206.599999999995, 0.15361974288968505, 3.6560611988570573, 0.11446471076643523], "isController": false}, {"data": ["2.5 Select flu", 530, 0, 0.0, 481.35283018867904, 179, 11705, 303.5, 619.8000000000001, 821.4999999999994, 4520.47999999996, 0.15211783908860174, 3.5886092735985713, 0.10547232983682348], "isController": false}, {"data": ["5.1 Consent start", 40, 1, 2.5, 982.05, 138, 4672, 661.0, 2509.8999999999996, 4193.7, 4672.0, 0.013344182153424068, 0.16612855209618752, 0.028413725358716634], "isController": false}, {"data": ["5.5 Consent agree", 37, 0, 0.0, 448.89189189189193, 289, 953, 349.0, 783.4000000000002, 881.0000000000001, 953.0, 0.0126097001311068, 0.21229113107391365, 0.01984110755426687], "isController": false}, {"data": ["1.5 Open Sessions list", 82, 0, 0.0, 208.30487804878055, 151, 2058, 167.5, 252.7, 312.8999999999999, 2058.0, 0.024122081264938405, 0.2850363118220261, 0.01459942084942085], "isController": false}, {"data": ["4.2 Vaccination batch", 1762, 0, 0.0, 698.9909194097618, 283, 21312, 368.5, 726.7, 2242.0, 8191.789999999993, 0.5137963954937549, 10.817085861096661, 0.8318556508053657], "isController": false}, {"data": ["5.0 Consent for hpv", 10, 0, 0.0, 6187.7, 3959, 10994, 4857.5, 10838.900000000001, 10994.0, 10994.0, 0.0038410098475810477, 0.8509644787730432, 0.06156118517431655], "isController": true}, {"data": ["5.7 Consent triage", 37, 0, 0.0, 1042.5675675675677, 311, 10718, 622.0, 2325.2000000000003, 4096.700000000011, 10718.0, 0.012589890114078016, 0.20526923958509846, 0.021230818706943426], "isController": false}, {"data": ["5.0 Consent for flu", 13, 1, 7.6923076923076925, 8130.153846153846, 140, 28562, 6108.0, 22899.199999999997, 28562.0, 28562.0, 0.004675710690041384, 0.967891431054308, 0.06784627616509718], "isController": true}, {"data": ["Log name and address", 1, 0, 0.0, 108.0, 108, 108, 108.0, 108.0, 108.0, 108.0, 9.25925925925926, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 552, 0, 0.0, 1061.0615942028978, 465, 10853, 847.0, 1403.3, 2032.5500000000015, 6420.7200000000075, 0.15664809402972113, 10.817307628354241, 0.10360787324813796], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.008157937673356175], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12258, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.1 Consent start", 40, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
