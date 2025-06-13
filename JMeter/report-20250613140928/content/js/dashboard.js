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

    var data = {"OkPercent": 96.1427193828351, "KoPercent": 3.8572806171648986};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6128659476117103, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.9615384615384616, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.48, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.08333333333333333, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.47, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9629629629629629, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4807692307692308, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.8923076923076924, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.5, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9545454545454546, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.9016393442622951, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.9714285714285714, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.9545454545454546, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.9659090909090909, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.08620689655172414, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.93, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.8181818181818182, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9705882352941176, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session runOnce"], "isController": false}, {"data": [0.8879310344827587, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7954545454545454, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.48, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1037, 40, 3.8572806171648986, 550.2574734811957, 0, 6026, 439.0, 1057.2, 1175.0, 1461.5399999999927, 1.7287712887264775, 62.108580853503724, 2.0421726238355387], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 89, 39, 43.82022471910113, 2571.910112359551, 142, 6694, 3949.0, 4881.0, 5066.0, 6694.0, 0.17466117694158467, 20.919300020189066, 0.47024325187221083], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 275.0, 275, 275, 275.0, 275.0, 275.0, 275.0, 3.6363636363636362, 55.124289772727266, 2.208806818181818], "isController": false}, {"data": ["1.4 Select Organisations", 26, 1, 3.8461538461538463, 398.6153846153846, 145, 446, 403.5, 439.5, 444.95, 446.0, 0.08662710695449077, 1.2119074997417847, 0.12289309756877692], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 262.0, 262, 262, 262.0, 262.0, 262.0, 262.0, 3.8167938931297707, 43.650852814885496, 2.318404103053435], "isController": false}, {"data": ["2.3 Search by first/last name", 50, 0, 0.0, 964.4000000000001, 726, 1640, 831.0, 1304.2, 1422.6499999999992, 1640.0, 0.11918411323444231, 5.928802073773774, 0.1028451817736503], "isController": false}, {"data": ["5.8 Consent confirm", 22, 0, 0.0, 982.8181818181818, 842, 1359, 939.0, 1322.3, 1357.05, 1359.0, 0.08684461918634487, 7.319966725188098, 0.18870046649376693], "isController": false}, {"data": ["1.2 Sign-in page", 27, 0, 0.0, 177.14814814814818, 135, 810, 144.0, 197.3999999999998, 643.9999999999991, 810.0, 0.046763368694522627, 0.31229872537345743, 0.03060896568521325], "isController": false}, {"data": ["3.0 Nurse triage", 66, 0, 0.0, 1599.2575757575758, 843, 1825, 1673.5, 1737.9, 1760.55, 1825.0, 0.14522826141967227, 17.180264373197023, 0.4328955696028447], "isController": true}, {"data": ["2.4 Patient attending session", 50, 0, 0.0, 1106.1400000000006, 943, 1990, 1034.0, 1364.7, 1703.549999999999, 1990.0, 0.11981328297980427, 5.410283458009039, 0.17808185224146691], "isController": false}, {"data": ["5.4 Consent route", 22, 0, 0.0, 429.86363636363643, 412, 453, 430.5, 444.7, 451.79999999999995, 453.0, 0.08888565668319132, 1.0153276623274305, 0.13827622177375368], "isController": false}, {"data": ["1.1 Homepage", 27, 0, 0.0, 435.88888888888886, 390, 626, 427.0, 468.4, 581.1999999999998, 626.0, 0.046768390803602206, 0.2732807934127588, 0.02796326202164164], "isController": false}, {"data": ["1.3 Sign-in", 26, 0, 0.0, 600.6538461538463, 507, 1809, 528.5, 802.2, 1464.9499999999985, 1809.0, 0.0864166345374051, 0.855785645615353, 0.1360808820230134], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 6026.0, 6026, 6026, 6026.0, 6026.0, 6026.0, 6026.0, 0.1659475605708596, 1649.1299745374213, 0.10387928352140724], "isController": false}, {"data": ["3.3 Nurse triage complete", 65, 0, 0.0, 397.19999999999993, 292, 768, 312.0, 709.8, 735.5999999999999, 768.0, 0.15412704811135086, 3.6898121835949538, 0.10429510587342612], "isController": false}, {"data": ["4.3 Vaccination confirm", 48, 0, 0.0, 999.1874999999997, 788, 1400, 879.0, 1284.6, 1315.4499999999998, 1400.0, 0.19342203882947429, 4.819074365988749, 0.4501532768917078], "isController": false}, {"data": ["5.6 Consent questions", 22, 0, 0.0, 460.1363636363636, 415, 695, 434.0, 628.4999999999999, 693.8, 695.0, 0.08855755838760838, 1.0677066561068487, 0.17175323335721704], "isController": false}, {"data": ["4.1 Vaccination questions", 61, 0, 0.0, 498.50819672131155, 422, 734, 446.0, 717.0, 724.0, 734.0, 0.15105478336020128, 1.7581399336844739, 0.30597154304318436], "isController": false}, {"data": ["5.3 Consent parent details", 22, 0, 0.0, 439.1363636363636, 413, 498, 432.5, 480.8, 495.59999999999997, 498.0, 0.08725865050530691, 0.9906072384025321, 0.14492884081840682], "isController": false}, {"data": ["3.1 Nurse triage new", 70, 0, 0.0, 289.5142857142857, 250, 552, 270.0, 322.8, 526.95, 552.0, 0.14601737606775209, 1.6459140557369185, 0.10054991186808374], "isController": false}, {"data": ["3.2 Nurse triage result", 66, 0, 0.0, 917.2272727272726, 527, 1240, 1070.5, 1143.9, 1178.25, 1240.0, 0.14639015193523344, 12.216141645641565, 0.23801829183764], "isController": false}, {"data": ["5.2 Consent who", 22, 0, 0.0, 481.5909090909091, 427, 847, 441.0, 734.9999999999998, 846.4, 847.0, 0.08842763604792778, 1.3271485591822052, 0.13765005064491884], "isController": false}, {"data": ["1.0 Login", 26, 1, 3.8461538461538463, 2110.4615384615386, 1702, 8416, 1795.5, 2340.8000000000006, 6550.849999999993, 8416.0, 0.08483480054033242, 36.430550021127125, 0.41054894233843864], "isController": true}, {"data": ["5.0 Consent", 22, 0, 0.0, 5008.954545454546, 4758, 5308, 4994.0, 5261.8, 5301.25, 5308.0, 0.08639580273481987, 17.810689553863856, 1.2920368043665225], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 44, 0, 0.0, 329.31818181818176, 287, 586, 312.5, 355.0, 576.75, 586.0, 0.127409560929279, 2.8963929294570905, 0.09213552721497177], "isController": false}, {"data": ["4.0 Vaccination", 58, 0, 0.0, 1811.5689655172416, 854, 2421, 1965.0, 2166.8, 2197.3999999999996, 2421.0, 0.14758194614785677, 7.4300373312349555, 0.8188422466679559], "isController": true}, {"data": ["2.5 Patient return to consent page", 50, 0, 0.0, 373.82, 287, 737, 317.0, 704.7, 732.35, 737.0, 0.11896575927516541, 2.7181189795890446, 0.08248602449742916], "isController": false}, {"data": ["5.5 Consent agree", 22, 0, 0.0, 586.090909090909, 417, 870, 448.0, 858.0, 868.65, 870.0, 0.08834383420271698, 1.5380799571933967, 0.13579413577644192], "isController": false}, {"data": ["Debug Sampler", 48, 0, 0.0, 0.4375, 0, 1, 0.0, 1.0, 1.0, 1.0, 0.19444692004180608, 0.7762843877352604, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 51, 0, 0.0, 290.6274509803922, 250, 548, 265.0, 358.00000000000017, 531.4, 548.0, 0.1199444022417844, 1.29900724693495, 0.07485041492531697], "isController": false}, {"data": ["2.1 Open session runOnce", 39, 39, 100.0, 202.3589743589744, 142, 499, 149.0, 424.0, 468.0, 499.0, 0.07611894854359078, 0.34781304710494265, 0.04608764462600223], "isController": false}, {"data": ["4.2 Vaccination batch", 58, 0, 0.0, 492.72413793103453, 414, 779, 438.5, 704.2, 733.7499999999999, 779.0, 0.1463611587766226, 2.647229093854093, 0.23384467737458364], "isController": false}, {"data": ["5.7 Consent triage", 22, 0, 0.0, 617.5909090909091, 432, 893, 483.0, 881.8, 892.85, 893.0, 0.08782785739949699, 1.4372104113437663, 0.14520758064194178], "isController": false}, {"data": ["2.2 Session register", 50, 0, 0.0, 903.88, 540, 2173, 802.5, 1289.0999999999997, 1510.3999999999999, 2173.0, 0.11876879516183436, 8.891326608099794, 0.07638318138845472], "isController": false}, {"data": ["5.1 Consent homepage", 22, 0, 0.0, 695.7727272727273, 572, 897, 600.5, 886.8, 896.1, 897.0, 0.08849379537821042, 1.1165545933810663, 0.18848141378894231], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 52.0, 52, 52, 52.0, 52.0, 52.0, 52.0, 19.230769230769234, 0.13146033653846154, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 2.5, 0.09643201542912247], "isController": false}, {"data": ["404/Not Found", 39, 97.5, 3.760848601735776], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1037, 40, "404/Not Found", 39, "422/Unprocessable Entity", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Select Organisations", 26, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session runOnce", 39, 39, "404/Not Found", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
