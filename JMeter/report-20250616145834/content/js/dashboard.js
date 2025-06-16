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

    var data = {"OkPercent": 99.85572483841182, "KoPercent": 0.144275161588181};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6406360424028269, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.47519729425028184, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.34628493524199044, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.4150622876557191, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.37737961926091823, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9534883720930233, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.47315202231520226, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7464358452138493, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.9705683355886333, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.49625085207907293, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.44285714285714284, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [1.0, 500, 1500, "Already vaccinated"], "isController": false}, {"data": [0.8233438485804416, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.062457569585879155, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8558456299659478, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.25, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9805045871559633, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9278314917127072, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.75, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.4702914798206278, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.75, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17328, 25, 0.144275161588181, 580.5030586334274, 0, 6201, 424.0, 1159.1000000000004, 1402.0, 2221.0, 4.812940276544082, 153.84353176044442, 5.115480673245019], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 885, 0, 0.0, 5143.092655367232, 3300, 10038, 4977.0, 6272.4, 6935.099999999999, 8420.139999999996, 0.2528103368290671, 73.06570231782801, 1.1010743247571593], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 129.0, 129, 129, 129.0, 129.0, 129.0, 129.0, 7.751937984496124, 117.47516957364341, 4.708696705426356], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 293.1285714285714, 188, 835, 309.0, 351.0, 462.10000000000014, 835.0, 0.0778067391751374, 1.1177120442053432, 0.11245505271406579], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 123.0, 123, 123, 123.0, 123.0, 123.0, 123.0, 8.130081300813009, 93.60708841463415, 4.9383892276422765], "isController": false}, {"data": ["2.3 Search by first/last name", 887, 0, 0.0, 1036.1003382187146, 658, 4783, 979.0, 1287.8000000000002, 1502.999999999999, 2272.1200000000003, 0.2520880392609358, 22.747966962896164, 0.2174655113472301], "isController": false}, {"data": ["5.8 Consent confirm", 2, 0, 0.0, 793.5, 608, 979, 793.5, 979.0, 979.0, 979.0, 0.0011871000214865102, 0.09923356278245561, 0.0025793921365307474], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 90.65714285714284, 83, 173, 88.5, 93.0, 101.45, 173.0, 0.07882847374561375, 0.47504932762127194, 0.047497234668987975], "isController": false}, {"data": ["3.0 Nurse triage", 1467, 0, 0.0, 1477.8657123381045, 681, 5551, 1391.0, 1870.2, 2272.999999999999, 3499.9599999999964, 0.42370617262199606, 49.97799740707419, 1.2741305895747197], "isController": true}, {"data": ["2.4 Patient attending session", 883, 0, 0.0, 1307.8357870894683, 856, 5223, 1166.0, 1733.4, 2131.3999999999996, 3913.119999999996, 0.251707003925546, 19.52652899043613, 0.3741191991940245], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 312.0, 280, 344, 312.0, 344.0, 344.0, 344.0, 0.001184375949351347, 0.013470541498164514, 0.0018424911008952105], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 269.9428571428572, 247, 560, 260.0, 289.9, 316.25000000000006, 560.0, 0.07890480135716259, 0.40723815934824636, 0.04276578589182152], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 467.90000000000015, 413, 1229, 433.0, 526.9, 638.6000000000001, 1229.0, 0.07792254054198466, 0.756168247427443, 0.12259102813782939], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 3824.0, 3824, 3824, 3824.0, 3824.0, 3824.0, 3824.0, 0.2615062761506276, 2599.233970482479, 0.16369679981694563], "isController": false}, {"data": ["2.1 Open session", 893, 0, 0.0, 1338.8846584546473, 651, 4313, 1213.0, 1933.0000000000005, 2297.2999999999993, 3617.899999999999, 0.2521490553869542, 4.159589441847736, 0.16518852562616546], "isController": false}, {"data": ["3.3 Nurse triage complete", 1462, 0, 0.0, 353.045143638851, 146, 4043, 301.0, 464.70000000000005, 564.8499999999999, 1735.649999999995, 0.42244274773868884, 9.84943672148237, 0.28617417051546107], "isController": false}, {"data": ["4.3 Vaccination confirm", 1434, 0, 0.0, 945.6659693165974, 568, 4603, 844.0, 1258.0, 1517.0, 2430.300000000004, 0.42677072650424774, 10.730538041651364, 0.9933675041322954], "isController": false}, {"data": ["5.6 Consent questions", 2, 0, 0.0, 297.0, 248, 346, 297.0, 346.0, 346.0, 346.0, 0.0011840520035639966, 0.014217296298653436, 0.002296413358474704], "isController": false}, {"data": ["4.1 Vaccination questions", 1473, 25, 1.6972165648336728, 490.5410726408687, 89, 2670, 491.0, 620.0, 791.0, 1583.6, 0.43232359993777825, 4.960748158937623, 0.9178561657291828], "isController": false}, {"data": ["5.3 Consent parent details", 2, 0, 0.0, 291.5, 241, 342, 291.5, 342.0, 342.0, 342.0, 0.0011836960079260285, 0.013378423581769425, 0.0019680102084902963], "isController": false}, {"data": ["3.1 Nurse triage new", 1478, 0, 0.0, 332.6048714479023, 108, 3413, 273.0, 436.0, 509.0999999999999, 1228.2100000000037, 0.42389749367021806, 4.7576544145389095, 0.2921319745908156], "isController": false}, {"data": ["3.2 Nurse triage result", 1467, 0, 0.0, 793.7041581458749, 372, 4538, 705.0, 1019.2, 1281.199999999999, 2410.119999999999, 0.42304038867808963, 35.321679820533696, 0.6949886885538882], "isController": false}, {"data": ["5.2 Consent who", 2, 0, 0.0, 347.0, 277, 417, 347.0, 417.0, 417.0, 417.0, 0.0011825593777845577, 0.01770201310778378, 0.0018408199689341652], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1383.8999999999999, 1059, 5562, 1329.0, 1525.6, 1905.1500000000005, 5562.0, 0.07881613659061659, 14.853337464026064, 0.3772959685968363], "isController": true}, {"data": ["5.0 Consent", 2, 0, 0.0, 4428.0, 3040, 5816, 4428.0, 5816.0, 5816.0, 5816.0, 0.0011760783315211925, 0.2398665737295267, 0.017592363128003777], "isController": true}, {"data": ["Already vaccinated", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 111.328125, 0.0], "isController": false}, {"data": ["5.9 Patient return to menacwy vaccination page", 634, 0, 0.0, 418.96214511041023, 145, 2212, 332.0, 582.0, 689.25, 1350.3999999999992, 0.1890889699393275, 5.371600101005273, 0.13187611209068875], "isController": false}, {"data": ["4.0 Vaccination", 1473, 25, 1.6972165648336728, 1822.7298031228802, 89, 5723, 1725.0, 2345.4000000000005, 2694.3, 3824.7799999999997, 0.4284492638118896, 22.67613926818946, 2.561392620539532], "isController": true}, {"data": ["2.5 Patient return to consent page", 881, 0, 0.0, 395.8683314415435, 143, 2321, 315.0, 570.8000000000001, 653.0999999999998, 1171.3799999999978, 0.25211305653742605, 5.517493839899338, 0.1748049513101294], "isController": false}, {"data": ["5.5 Consent agree", 2, 0, 0.0, 1182.5, 512, 1853, 1182.5, 1853.0, 1853.0, 1853.0, 0.0011832688156011627, 0.020542540399755536, 0.0018188135896056935], "isController": false}, {"data": ["Debug Sampler", 2322, 0, 0.0, 0.231696813092162, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.6600902123290183, 2.5997981352025086, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 872, 0, 0.0, 311.37385321100896, 106, 3233, 254.0, 418.0, 462.3499999999999, 1013.27, 0.2454324790481723, 2.6568545217275297, 0.1583675631777539], "isController": false}, {"data": ["4.2 Vaccination batch", 1448, 0, 0.0, 418.6629834254149, 221, 2900, 367.0, 527.0, 641.1499999999994, 1505.5599999999986, 0.42520352801468714, 7.341845710179455, 0.6874004025705432], "isController": false}, {"data": ["5.7 Consent triage", 2, 0, 0.0, 432.5, 251, 614, 432.5, 614.0, 614.0, 614.0, 0.001186211477782259, 0.01936976769530972, 0.0019635043504305947], "isController": false}, {"data": ["2.2 Session register", 892, 0, 0.0, 1070.6378923766808, 463, 6201, 997.0, 1388.1000000000001, 1635.3999999999978, 2229.679999999992, 0.2521720865289502, 20.020333671447478, 0.16741882309845427], "isController": false}, {"data": ["5.1 Consent homepage", 2, 0, 0.0, 543.5, 434, 653, 543.5, 653.0, 653.0, 653.0, 0.001179540168060883, 0.014828916360870878, 0.0025122823306062366], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 58.0, 58, 58, 58.0, 58.0, 58.0, 58.0, 17.241379310344826, 0.11786099137931035, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 25, 100.0, 0.144275161588181], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17328, 25, "422/Unprocessable Entity", 25, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1473, 25, "422/Unprocessable Entity", 25, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
