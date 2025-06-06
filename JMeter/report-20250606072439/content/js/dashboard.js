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

    var data = {"OkPercent": 98.76007263647713, "KoPercent": 1.2399273635228691};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.536308263043778, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6691919191919192, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.35459889349930845, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.6454011065006916, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.37549083769633507, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.1006021962451293, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.8684976355038195, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.8448778709442216, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.5263157894736842, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [0.7335372436128104, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.2708333333333333, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.03571428571428571, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "2.3 Search by first/last name-0"], "isController": false}, {"data": [0.6144189383070301, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.6976327116212339, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.6777816777816777, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.8522377861291425, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.6786104037831939, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6621273463378726, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.8316157526683843, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.7561830933923958, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.3385975994946305, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.7839259796806967, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.8374455732946299, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}, {"data": [0.855191256830601, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.5476190476190477, 500, 1500, "1.2 Sign-in page-0"], "isController": false}, {"data": [0.8743169398907104, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.4523809523809524, 500, 1500, "1.2 Sign-in page-1"], "isController": false}, {"data": [0.8459595959595959, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.5934343434343434, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.8616504854368932, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.20847573479152426, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5434782608695652, 500, 1500, "1.1 Homepage-0"], "isController": false}, {"data": [1.0, 500, 1500, "2.3 Search by first/last name-1"], "isController": false}, {"data": [0.8095238095238095, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.33663366336633666, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5, 500, 1500, "1.1 Homepage-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.46915584415584416, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.8106624158696423, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.3213778409090909, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.8070175438596491, 500, 1500, "6.1 Logout-0"], "isController": false}, {"data": [0.793859649122807, 500, 1500, "6.1 Logout-1"], "isController": false}, {"data": [0.8201754385964912, 500, 1500, "6.1 Logout-2"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session-0"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session-1"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [1.0, 500, 1500, "2.2 Session register-0"], "isController": false}, {"data": [0.0, 500, 1500, "2.2 Session register-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 70488, 874, 1.2399273635228691, 3296.193947906016, 0, 101272, 635.0, 15204.600000000006, 23966.90000000003, 51078.56000000007, 6.492408391719692, 184.13683943048363, 6.206979914255455], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations", 198, 15, 7.575757575757576, 2502.3787878787875, 147, 60128, 352.0, 7551.299999999997, 10720.499999999989, 36434.32999999978, 0.020293439028669914, 0.275582984285755, 0.02885933775692724], "isController": false}, {"data": ["2.4 Patient attending session-1", 2892, 43, 1.4868603042876902, 3894.9674965421805, 492, 60392, 1010.0, 12127.300000000005, 18282.449999999997, 34025.95000000005, 0.2690300128468343, 21.44001514674671, 0.17970364139378386], "isController": false}, {"data": ["2.4 Patient attending session-0", 2892, 0, 0.0, 2795.955739972338, 189, 29810, 482.5, 10621.500000000018, 15210.099999999999, 25216.350000000002, 0.270542547259115, 0.20107942395298772, 0.22140102988587726], "isController": false}, {"data": ["2.3 Search by first/last name", 3056, 75, 2.4541884816753927, 3835.306937172776, 486, 60392, 950.0, 11153.500000000004, 20389.500000000007, 44280.229999999676, 0.2836986092176983, 26.442022665021657, 0.24478594798943926], "isController": false}, {"data": ["3.0 Nurse triage", 2823, 59, 2.0899752036840242, 8045.129649309239, 911, 98364, 3812.0, 19110.8, 26945.999999999964, 49141.31999999986, 0.2635796752900077, 29.222430011945818, 0.7864954940526976], "isController": true}, {"data": ["4.2 Vaccination batch-2", 2743, 0, 0.0, 0.32300401020780234, 0, 6, 0.0, 1.0, 1.0, 1.0, 0.25905206587647756, 1.2981429978264372, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch-0", 2749, 0, 0.0, 1057.3695889414325, 0, 26762, 169.0, 2947.0, 7300.0, 14398.0, 0.25960758175018195, 0.19655108311560074, 0.23273211174855105], "isController": false}, {"data": ["4.2 Vaccination batch-1", 2743, 4, 0.14582573824279985, 1267.6179365658031, 165, 48738, 210.0, 4393.4, 8202.799999999997, 14777.079999999993, 0.25904702614863934, 3.5195444526892588, 0.18635384322186882], "isController": false}, {"data": ["6.1 Logout", 114, 0, 0.0, 4280.736842105264, 406, 32319, 646.5, 12265.5, 16284.25, 32047.94999999999, 0.021179025185205, 0.13282410695342695, 0.04477791945895393], "isController": false}, {"data": ["3.3 Nurse triage complete", 2779, 15, 0.5397625044980209, 1928.5383231378207, 196, 60406, 325.0, 6668.0, 10660.0, 21869.999999999898, 0.26144654166153936, 6.038155367700241, 0.17668067073221214], "isController": false}, {"data": ["4.3 Vaccination confirm", 2736, 44, 1.608187134502924, 5978.93347953216, 571, 101272, 1323.0, 16205.500000000004, 24340.350000000024, 45517.19000000007, 0.2584233643435074, 6.176694873053064, 0.5981115303551111], "isController": false}, {"data": ["1.0 Login", 210, 27, 12.857142857142858, 12249.414285714283, 1250, 113452, 5939.5, 36352.6, 48813.14999999999, 105149.13999999958, 0.02147709432095513, 0.9710270346184681, 0.1029488296594377], "isController": true}, {"data": ["2.3 Search by first/last name-0", 1, 0, 0.0, 3281.0, 3281, 3281, 3281.0, 3281.0, 3281.0, 3281.0, 0.30478512648582745, 0.20358693995733007, 0.26252000152392563], "isController": false}, {"data": ["3.2 Nurse triage result-1", 2788, 9, 0.32281205164992827, 1825.852582496413, 260, 48996, 565.5, 6052.399999999998, 9383.3, 16533.67000000004, 0.2619776058009434, 20.202031438915995, 0.18667677290149878], "isController": false}, {"data": ["3.2 Nurse triage result-0", 2788, 0, 0.0, 2279.402080344332, 204, 29685, 400.0, 8680.899999999998, 13313.249999999996, 22196.850000000006, 0.2627732740729961, 0.1947863481802904, 0.2443069688311123], "isController": false}, {"data": ["2.5 Patient return to consent page", 2849, 18, 0.6318006318006318, 2376.670410670405, 194, 60140, 367.0, 8627.0, 12915.5, 23087.5, 0.26657387263532645, 6.0022908019663035, 0.18483149372175958], "isController": false}, {"data": ["1.5 Open Sessions list", 2927, 6, 0.20498804236419543, 1282.1513495046133, 163, 60129, 237.0, 3681.40000000001, 8526.799999999992, 13590.959999999995, 0.2723982915313167, 3.2021920335249057, 0.17656210593217775], "isController": false}, {"data": ["4.2 Vaccination batch", 2749, 10, 0.3637686431429611, 2410.443433975989, 312, 69138, 415.0, 7997.0, 11494.0, 22257.5, 0.25960226175991635, 5.014373408000226, 0.4195820670365], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 2717, 0, 0.0, 2227.2127346337847, 210, 29099, 491.0, 7880.200000000003, 12797.99999999999, 24112.400000000012, 0.2587916288289874, 0.19511764875089463, 0.24812820167725932], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 2717, 8, 0.2944423997055576, 1405.4571218255455, 147, 43363, 176.0, 5037.60000000001, 9019.8, 15288.520000000015, 0.25810342148051235, 0.19276008325141533, 0.17416939867483794], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 2709, 17, 0.6275378368401624, 2120.9904023624986, 196, 60125, 388.0, 7436.0, 12194.0, 24921.500000000033, 0.25588606429758426, 5.790650432308359, 0.1771711128779172], "isController": false}, {"data": ["2.2 Session register", 3166, 110, 3.474415666456096, 5300.100442198357, 483, 60419, 1047.0, 16023.900000000001, 25511.3, 52015.74999999997, 0.2936224299342781, 23.198658529767528, 0.19585455395312149], "isController": false}, {"data": ["4.1 Vaccination questions-0", 2756, 0, 0.0, 1726.0863570391884, 156, 29695, 451.0, 6127.200000000003, 10472.85000000001, 17529.179999999997, 0.2608220816744096, 0.194606227624049, 0.3456063743719592], "isController": false}, {"data": ["4.1 Vaccination questions-1", 2756, 6, 0.21770682148040638, 1379.0224963715548, 159, 60126, 197.0, 4949.3, 8655.75000000001, 15567.759999999978, 0.260334603645289, 2.8290082755893047, 0.1867732596239733], "isController": false}, {"data": ["1.4 Select Organisations-0", 183, 0, 0.0, 1020.5628415300554, 137, 16450, 152.0, 4555.199999999996, 7042.599999999991, 14096.31999999999, 0.019291451346485324, 0.013997708758013202, 0.015410553907641598], "isController": false}, {"data": ["1.2 Sign-in page-0", 21, 0, 0.0, 4605.285714285715, 139, 26266, 458.0, 15814.400000000003, 25324.999999999985, 26266.0, 0.004256364481003238, 0.0028599428192901686, 0.0027849259787814155], "isController": false}, {"data": ["1.4 Select Organisations-1", 183, 0, 0.0, 852.1475409836063, 156, 21433, 179.0, 2196.799999999998, 4529.0, 15336.279999999975, 0.019272983058626625, 0.262914355806597, 0.013075641975956797], "isController": false}, {"data": ["2.0 Register attendance", 3498, 616, 17.61006289308176, 30657.028016009048, 5490, 149619, 25610.0, 58111.299999999996, 66772.49999999999, 95262.26999999999, 0.3237715217122682, 82.12095010451651, 1.239062920131267], "isController": true}, {"data": ["1.2 Sign-in page-1", 21, 3, 14.285714285714286, 11357.952380952382, 161, 42689, 1720.0, 39591.200000000004, 42523.399999999994, 42689.0, 0.004256100512069693, 0.051943466280233004, 0.002768127872107828], "isController": false}, {"data": ["1.3 Sign-in-1", 198, 0, 0.0, 1453.0959595959596, 139, 26478, 162.0, 3956.3999999999974, 11496.299999999996, 24839.549999999985, 0.020301876600887562, 0.19047748680813795, 0.014062978709022124], "isController": false}, {"data": ["1.3 Sign-in-0", 198, 0, 0.0, 2749.2727272727275, 146, 24971, 565.0, 9549.9, 12797.599999999966, 24619.549999999996, 0.020309500373982013, 0.014400921474342536, 0.018544319189133966], "isController": false}, {"data": ["1.2 Sign-in page", 206, 4, 1.941747572815534, 2235.1990291262136, 133, 47312, 145.0, 4717.600000000004, 12742.249999999982, 41120.140000000036, 0.021144533045056025, 0.1416395230031991, 0.014864844093454321], "isController": false}, {"data": ["2.4 Patient attending session", 2926, 77, 2.6315789473684212, 7092.169856459329, 172, 85613, 1723.5, 20360.100000000002, 28445.000000000007, 48778.120000000024, 0.2719202223612284, 21.620400545033466, 0.4020520921686883], "isController": false}, {"data": ["1.1 Homepage-0", 23, 0, 0.0, 3341.8695652173915, 139, 14457, 414.0, 10958.000000000004, 13983.199999999993, 14457.0, 0.004664495040019339, 0.0032708107840488873, 0.0030155231606375024], "isController": false}, {"data": ["2.3 Search by first/last name-1", 1, 0, 0.0, 138.0, 138, 138, 138.0, 138.0, 138.0, 138.0, 7.246376811594203, 41.05100769927536, 4.684669384057971], "isController": false}, {"data": ["1.1 Homepage", 210, 4, 1.9047619047619047, 2323.7714285714283, 131, 60401, 392.5, 6031.900000000002, 11318.699999999979, 42070.38999999991, 0.0215641128801214, 0.1303762413997697, 0.014725850298642425], "isController": false}, {"data": ["1.3 Sign-in", 202, 4, 1.9801980198019802, 4830.237623762376, 308, 37079, 822.5, 13554.700000000012, 28921.999999999996, 36701.31, 0.02064532587267128, 0.2044844231655069, 0.032868654711472885], "isController": false}, {"data": ["1.1 Homepage-1", 23, 1, 4.3478260869565215, 5729.217391304347, 162, 42576, 766.0, 20043.400000000012, 38704.59999999995, 42576.0, 0.0046644222007839065, 0.0612207394331064, 0.0030336964704317207], "isController": false}, {"data": ["2.1 Open session", 3511, 335, 9.541441184847622, 14643.037596126456, 2310, 60419, 10550.0, 29724.400000000012, 43763.39999999978, 60392.0, 0.3250016823997658, 5.119491358597747, 0.2139589768743854], "isController": false}, {"data": ["4.1 Vaccination questions", 2772, 22, 0.7936507936507936, 3227.66955266955, 145, 67264, 664.0, 10308.800000000012, 14554.749999999998, 29303.899999999987, 0.2601788645219931, 3.0078681631538764, 0.530302449013343], "isController": false}, {"data": ["3.1 Nurse triage new", 2823, 7, 0.2479631597591215, 1687.9759121501963, 163, 60129, 215.0, 6393.199999999999, 9900.599999999995, 17648.839999999982, 0.26483808617472954, 2.9757555069587776, 0.18207618424512653], "isController": false}, {"data": ["3.2 Nurse triage result", 2816, 37, 1.3139204545454546, 4469.755326704535, 515, 60404, 1114.5, 13085.500000000011, 19059.050000000007, 34265.12999999998, 0.26299548873079276, 20.2736231848198, 0.4300519964775789], "isController": false}, {"data": ["6.1 Logout-0", 114, 0, 0.0, 1452.0438596491217, 141, 18499, 163.5, 7107.5, 9323.0, 17406.54999999996, 0.021251588043558298, 0.015316267962485353, 0.016623556662978708], "isController": false}, {"data": ["6.1 Logout-1", 114, 0, 0.0, 1460.254385964912, 129, 21568, 142.0, 5740.5, 7457.75, 20167.599999999948, 0.021268573388052023, 0.008287266388508553, 0.01356286955312302], "isController": false}, {"data": ["6.1 Logout-2", 114, 0, 0.0, 1368.3245614035093, 134, 28001, 150.5, 5248.0, 8590.75, 25437.0499999999, 0.021213805572494554, 0.10948726801819697, 0.014729507580120729], "isController": false}, {"data": ["2.1 Open session-0", 1, 0, 0.0, 12161.0, 12161, 12161, 12161.0, 12161.0, 12161.0, 12161.0, 0.08223007976317738, 0.05492712359180989, 0.054204398281391335], "isController": false}, {"data": ["2.1 Open session-1", 1, 0, 0.0, 20397.0, 20397, 20397, 20397.0, 20397.0, 20397.0, 20397.0, 0.04902681766926509, 0.2777388372064519, 0.0316950715791538], "isController": false}, {"data": ["4.0 Vaccination", 2770, 76, 2.743682310469314, 11502.804332129954, 145, 133405, 7242.5, 26062.10000000001, 36351.59999999998, 68788.12, 0.26000620260284046, 14.126387746440354, 1.541234871769071], "isController": true}, {"data": ["2.2 Session register-0", 1, 0, 0.0, 134.0, 134, 134, 134.0, 134.0, 134.0, 134.0, 7.462686567164179, 4.984841417910448, 4.984841417910448], "isController": false}, {"data": ["2.2 Session register-1", 1, 0, 0.0, 6708.0, 6708, 6708, 6708.0, 6708.0, 6708.0, 6708.0, 0.1490757304710793, 0.8445198363893858, 0.09637513044126415], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 718, 82.15102974828375, 1.0186130972647827], "isController": false}, {"data": ["504/Gateway Time-out", 134, 15.331807780320366, 0.19010327999092044], "isController": false}, {"data": ["422/Unprocessable Entity", 21, 2.402745995423341, 0.029792305073203948], "isController": false}, {"data": ["403/Forbidden", 1, 0.11441647597254005, 0.001418681193962093], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 70488, 874, "502/Bad Gateway", 718, "504/Gateway Time-out", 134, "422/Unprocessable Entity", 21, "403/Forbidden", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["1.4 Select Organisations", 198, 15, "422/Unprocessable Entity", 13, "504/Gateway Time-out", 1, "502/Bad Gateway", 1, "", "", "", ""], "isController": false}, {"data": ["2.4 Patient attending session-1", 2892, 43, "502/Bad Gateway", 40, "504/Gateway Time-out", 3, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 3056, 75, "502/Bad Gateway", 64, "504/Gateway Time-out", 11, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch-1", 2743, 4, "502/Bad Gateway", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["3.3 Nurse triage complete", 2779, 15, "502/Bad Gateway", 13, "504/Gateway Time-out", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["4.3 Vaccination confirm", 2736, 44, "502/Bad Gateway", 42, "504/Gateway Time-out", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["3.2 Nurse triage result-1", 2788, 9, "502/Bad Gateway", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Patient return to consent page", 2849, 18, "502/Bad Gateway", 15, "504/Gateway Time-out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["1.5 Open Sessions list", 2927, 6, "502/Bad Gateway", 5, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["4.2 Vaccination batch", 2749, 10, "502/Bad Gateway", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 2717, 8, "502/Bad Gateway", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 2709, 17, "502/Bad Gateway", 16, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["2.2 Session register", 3166, 110, "502/Bad Gateway", 93, "504/Gateway Time-out", 17, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions-1", 2756, 6, "502/Bad Gateway", 5, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page-1", 21, 3, "502/Bad Gateway", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 206, 4, "502/Bad Gateway", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.4 Patient attending session", 2926, 77, "502/Bad Gateway", 68, "504/Gateway Time-out", 8, "403/Forbidden", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 210, 4, "502/Bad Gateway", 3, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 202, 4, "502/Bad Gateway", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.1 Homepage-1", 23, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.1 Open session", 3511, 335, "502/Bad Gateway", 259, "504/Gateway Time-out", 76, "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 2772, 22, "502/Bad Gateway", 12, "422/Unprocessable Entity", 8, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, {"data": ["3.1 Nurse triage new", 2823, 7, "502/Bad Gateway", 6, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["3.2 Nurse triage result", 2816, 37, "502/Bad Gateway", 33, "504/Gateway Time-out", 4, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
