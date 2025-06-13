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

    var data = {"OkPercent": 99.96527174856746, "KoPercent": 0.03472825143254037};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.624261065987408, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9642857142857143, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.4821173104434907, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.48544698544698545, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.08746736292428199, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.4489051094890511, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9218106995884774, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9571428571428572, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4857142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.47863247863247865, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8496503496503497, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.47989276139410186, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8260869565217391, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7741364038972542, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.9200404858299596, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.97114556416882, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.4865217391304348, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.9119433198380567, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [1.0, 500, 1500, "Already vaccinated"], "isController": false}, {"data": [0.9319344933469805, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0035460992907801418, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9200879765395894, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.7572314049586777, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9629629629629629, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8544809228039042, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7396265560165975, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.49002849002849, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.4979757085020243, 500, 1500, "5.1 Consent homepage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17277, 6, 0.03472825143254037, 627.4374602072088, 0, 6186, 494.0, 1161.0, 1311.0, 1618.2200000000012, 4.798721451954179, 125.1397298747144, 6.042560858155799], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 697, 0, 0.0, 4454.519368723102, 2404, 10071, 4364.0, 4951.0, 5283.6, 6500.919999999995, 0.19816296956734228, 36.014915572748556, 0.8579895073134077], "isController": true}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 453.7285714285713, 413, 956, 431.5, 492.9, 588.5000000000002, 956.0, 0.07879236074294443, 1.132308220097455, 0.11387958388628687], "isController": false}, {"data": ["2.3 Search by first/last name", 699, 0, 0.0, 1026.2246065808292, 706, 2657, 909.0, 1411.0, 1473.0, 1680.0, 0.19823618011642902, 9.672204660262466, 0.17099980915513668], "isController": false}, {"data": ["5.8 Consent confirm", 481, 0, 0.0, 1059.6611226611237, 895, 2248, 990.0, 1386.8000000000002, 1450.8, 1750.0000000000005, 0.14619109881606487, 12.315225853280364, 0.3241169305400804], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 160.3857142857143, 150, 248, 157.0, 170.9, 184.1500000000001, 248.0, 0.07900926891594769, 0.47635931567250434, 0.04760617082142551], "isController": false}, {"data": ["3.0 Nurse triage", 1149, 0, 0.0, 1783.6362053959974, 854, 6775, 1800.0, 2003.0, 2159.0, 2889.0, 0.3303068144969332, 39.40083613449108, 0.9928095136016553], "isController": true}, {"data": ["2.4 Patient attending session", 685, 0, 0.0, 1162.8277372262785, 929, 3394, 1063.0, 1517.0, 1639.6999999999998, 2053.0999999999985, 0.19500036153351702, 8.614688352859702, 0.28983452173243446], "isController": false}, {"data": ["5.4 Consent route", 486, 0, 0.0, 489.22222222222246, 424, 2746, 460.5, 531.6, 635.4999999999998, 884.9599999999991, 0.14575121706764746, 1.6647934772169255, 0.23319714422832677], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 471.78571428571433, 442, 670, 463.5, 495.59999999999997, 520.4000000000001, 670.0, 0.07890871501666666, 0.4074785276704682, 0.042767907064697255], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 643.9000000000001, 534, 1937, 575.5, 890.9, 1068.1000000000001, 1937.0, 0.07892366165200754, 0.7660946310206069, 0.1241660341029142], "isController": false}, {"data": ["2.1 Open session", 702, 0, 0.0, 915.9017094017088, 535, 3840, 832.5, 1265.4, 1457.2000000000003, 2013.7600000000002, 0.19818801944952855, 3.3724035750528434, 0.12961866133591712], "isController": false}, {"data": ["3.3 Nurse triage complete", 1144, 0, 0.0, 478.7840909090904, 292, 4225, 349.0, 787.0, 812.0, 1029.1, 0.3297006698341755, 8.046369704543242, 0.22334027666900877], "isController": false}, {"data": ["4.3 Vaccination confirm", 1119, 0, 0.0, 1064.6103663985705, 807, 2991, 942.0, 1373.0, 1468.0, 1904.7999999999995, 0.3307203763651082, 8.301457637959754, 0.7698400408021462], "isController": false}, {"data": ["5.6 Consent questions", 483, 0, 0.0, 549.9523809523806, 428, 2444, 469.0, 758.6, 780.8, 950.5999999999957, 0.14623618930895377, 1.7630154702674274, 0.2900901626150966], "isController": false}, {"data": ["4.1 Vaccination questions", 1129, 1, 0.08857395925597875, 585.9158547387062, 441, 4503, 489.0, 777.0, 815.0, 1239.4000000000033, 0.3295893270276385, 3.834070514399463, 0.6739248411716623], "isController": false}, {"data": ["5.3 Consent parent details", 494, 5, 1.0121457489878543, 478.61133603238864, 294, 1155, 459.0, 520.0, 571.5, 975.8000000000002, 0.14777990606104027, 1.6844652814818315, 0.250896834163274], "isController": false}, {"data": ["3.1 Nurse triage new", 1161, 0, 0.0, 309.36434108527135, 263, 1017, 284.0, 354.0, 559.6999999999996, 611.7599999999998, 0.3318517671606809, 3.740741700132912, 0.22868514277343469], "isController": false}, {"data": ["3.2 Nurse triage result", 1150, 0, 0.0, 997.0104347826097, 549, 5548, 1096.0, 1274.0, 1376.3500000000001, 1815.1600000000008, 0.33057461629629376, 27.673769634964415, 0.5428520281902535], "isController": false}, {"data": ["5.2 Consent who", 494, 0, 0.0, 505.5445344129558, 439, 1664, 471.0, 557.0, 870.0, 964.2000000000007, 0.14763138296537057, 2.21501415927663, 0.2363921487187449], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2059.971428571428, 1832, 5130, 1924.5, 2419.8999999999996, 2776.9500000000016, 5130.0, 0.07877187888936152, 3.63149351060382, 0.375012607017224], "isController": true}, {"data": ["5.0 Consent", 486, 5, 1.02880658436214, 5457.549382716046, 1400, 10262, 5415.5, 5924.5, 6153.15, 7446.5599999999995, 0.14594134419184981, 29.82305374473928, 2.2180146510958365], "isController": true}, {"data": ["Already vaccinated", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 111.328125, 0.0], "isController": false}, {"data": ["5.9 Patient return to menacwy vaccination page", 977, 0, 0.0, 390.18116683725725, 292, 3101, 335.0, 627.0, 758.1999999999998, 978.8400000000006, 0.2902740371116991, 6.692529449853452, 0.20977937260549917], "isController": false}, {"data": ["4.0 Vaccination", 1128, 1, 0.08865248226950355, 2171.1808510638284, 448, 8344, 2157.0, 2462.2, 2636.0499999999993, 3404.5700000000024, 0.32660142552256954, 17.69089245287225, 1.9492987705613403], "isController": true}, {"data": ["2.5 Patient return to consent page", 682, 0, 0.0, 410.01026392961904, 292, 2225, 337.0, 759.0, 786.0, 981.5099999999999, 0.19469521206790583, 4.450489312674516, 0.13499375055489563], "isController": false}, {"data": ["5.5 Consent agree", 484, 0, 0.0, 653.8553719008268, 429, 4319, 490.5, 928.0, 962.75, 1552.0999999999988, 0.14581409606558018, 2.5385446942611307, 0.23058772175266132], "isController": false}, {"data": ["Debug Sampler", 1119, 0, 0.0, 0.29848078641644343, 0, 18, 0.0, 1.0, 1.0, 1.0, 0.33122433122433126, 1.52538983007733, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 702, 0, 0.0, 315.03133903133926, 259, 3563, 280.0, 373.0, 564.85, 630.9100000000001, 0.19721743615647377, 2.1358934100861267, 0.12705793023391054], "isController": false}, {"data": ["4.2 Vaccination batch", 1127, 0, 0.0, 529.7799467613119, 433, 1503, 471.0, 756.2, 787.9999999999995, 1088.9200000000003, 0.3294932411492911, 5.815069995203783, 0.5324366471036754], "isController": false}, {"data": ["5.7 Consent triage", 482, 0, 0.0, 639.5456431535264, 446, 1985, 504.0, 938.7, 976.9499999999998, 1331.5600000000027, 0.1461639395366482, 2.390652595266593, 0.24800914176598182], "isController": false}, {"data": ["2.2 Session register", 702, 0, 0.0, 962.2678062678067, 610, 6186, 863.0, 1328.6000000000004, 1402.7, 1637.5800000000004, 0.19809881575286298, 9.883866773890237, 0.13130142332729253], "isController": false}, {"data": ["5.1 Consent homepage", 494, 0, 0.0, 763.5182186234813, 600, 1899, 666.5, 954.0, 1014.25, 1187.1000000000004, 0.14763808943162327, 1.8622191322638537, 0.3210104607488897], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 6, 100.0, 0.03472825143254037], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17277, 6, "422/Unprocessable Entity", 6, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1129, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.3 Consent parent details", 494, 5, "422/Unprocessable Entity", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
