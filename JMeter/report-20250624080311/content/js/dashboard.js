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

    var data = {"OkPercent": 99.87220447284345, "KoPercent": 0.12779552715654952};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5081632653061224, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8804945054945055, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.7774566473988439, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.40582655826558267, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8416334661354582, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.008559201141226819, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.29218106995884774, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.8214285714285714, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8571428571428571, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.007142857142857143, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.49326145552560646, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4387694145758662, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.75, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.6627497062279671, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.7857142857142857, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.7142857142857143, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0068762278978389, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8027586206896552, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.75, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9736842105263158, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.788235294117647, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.4063342318059299, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10955, 14, 0.12779552715654952, 848.1778183477821, 85, 6706, 653.0, 1440.0, 1616.0, 2359.2000000000025, 3.042712405212079, 70.94648394774784, 4.155250509855694], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 736, 0, 0.0, 5641.347826086954, 3377, 11564, 5477.0, 6599.6, 7051.15, 9110.919999999998, 0.20997573011499882, 35.416780003812946, 0.9115613620371013], "isController": true}, {"data": ["2.5 Select patient", 728, 0, 0.0, 472.5123626373626, 331, 4739, 402.0, 652.4000000000001, 750.0499999999995, 1319.690000000005, 0.20857327855419755, 5.31481042402618, 0.14461623806003931], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 425.35714285714283, 385, 799, 406.0, 486.79999999999995, 501.5, 799.0, 0.07974681525397083, 1.1458153250309304, 0.1152590689217547], "isController": false}, {"data": ["2.5 Select menacwy", 519, 0, 0.0, 525.3063583815027, 335, 2086, 447.0, 696.0, 825.0, 1428.1999999999935, 0.1535129168252819, 3.468971465121067, 0.1070392798957532], "isController": false}, {"data": ["2.3 Search by first/last name", 738, 0, 0.0, 1361.1775067750682, 1045, 5501, 1280.5, 1641.2, 1815.3499999999997, 2445.5200000000004, 0.21016737353719378, 8.857214939764123, 0.18130534647785965], "isController": false}, {"data": ["2.5 Select td_ipv", 502, 0, 0.0, 522.0000000000002, 335, 3703, 420.5, 708.8, 882.8499999999999, 2315.8799999999883, 0.15311067828030478, 3.51118955359316, 0.10660929063853253], "isController": false}, {"data": ["4.0 Vaccination for hpv", 701, 0, 0.0, 2354.443651925819, 952, 7102, 2212.0, 2776.8, 3202.3999999999987, 5293.960000000004, 0.20410343997277067, 10.186556783611485, 1.1982111973993261], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 90.37142857142862, 85, 112, 89.0, 96.0, 103.80000000000001, 112.0, 0.07886550839523336, 0.47527251201854015, 0.04751954949204979], "isController": false}, {"data": ["2.4 Patient attending session", 729, 0, 0.0, 1560.393689986284, 1220, 6706, 1459.0, 1845.0, 2079.5, 3243.7000000000107, 0.2081824557876436, 8.116545343063413, 0.30942743916874377], "isController": false}, {"data": ["5.4 Consent route", 14, 0, 0.0, 528.7142857142857, 403, 1097, 478.0, 871.0, 1097.0, 1097.0, 0.004890460667422126, 0.05560340523212921, 0.007625993876968586], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 272.92857142857144, 247, 500, 260.0, 299.7, 338.8, 500.0, 0.07892036934732855, 0.40731850781311657, 0.042774223620866546], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 519.5285714285716, 450, 1363, 469.5, 630.3, 801.4500000000003, 1363.0, 0.07981428356418666, 0.7745259138450418, 0.1255671980682663], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 490, 0, 0.0, 2376.948979591838, 916, 6911, 2223.5, 2893.2000000000016, 3299.099999999999, 5435.549999999997, 0.15165306483106625, 8.361189952543423, 0.8937898364940101], "isController": true}, {"data": ["2.1 Open session", 742, 0, 0.0, 914.5417789757406, 409, 4135, 853.0, 1301.5000000000002, 1509.85, 2197.5000000000027, 0.21020663709042284, 3.5852132326069586, 0.13753754575252275], "isController": false}, {"data": ["4.3 Vaccination confirm", 1674, 0, 0.0, 1240.783154121864, 840, 6479, 1148.0, 1561.5, 1813.75, 4113.75, 0.49287495373776763, 10.106567727595463, 1.1474575374720404], "isController": false}, {"data": ["5.6 Consent questions", 14, 0, 0.0, 568.2857142857142, 430, 1165, 508.0, 930.0, 1165.0, 1165.0, 0.0048864834979961925, 0.05955469933990589, 0.009495170954497765], "isController": false}, {"data": ["4.1 Vaccination questions", 1702, 0, 0.0, 613.0393654524079, 420, 3670, 595.0, 764.7, 904.2499999999995, 1745.680000000004, 0.4950261793809672, 5.741295704848056, 0.9778826849396864], "isController": false}, {"data": ["5.3 Consent parent details", 14, 0, 0.0, 534.7142857142858, 423, 761, 477.5, 712.5, 761.0, 761.0, 0.004890284715869219, 0.05529098624031069, 0.008877626934325922], "isController": false}, {"data": ["5.2 Consent who", 14, 0, 0.0, 594.5, 443, 1197, 514.0, 967.5, 1197.0, 1197.0, 0.004893801022245122, 0.0973137931650728, 0.007635981798730548], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1674.8285714285714, 1517, 2653, 1634.0, 1818.1, 1988.7, 2653.0, 0.07877054926704004, 3.774832415656434, 0.3750062770281447], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 509, 0, 0.0, 2401.1021611001975, 871, 7692, 2226.0, 2869.0, 3480.5, 6044.199999999986, 0.15245075825532836, 7.894831119508965, 0.8988764230297387], "isController": true}, {"data": ["2.5 Select hpv", 725, 0, 0.0, 515.8731034482756, 335, 5031, 427.0, 698.9999999999999, 813.4999999999997, 1308.7000000000014, 0.20814157991229917, 4.245555259920745, 0.15508986862605886], "isController": false}, {"data": ["5.1 Consent start", 14, 0, 0.0, 778.2142857142858, 552, 1151, 760.5, 1097.5, 1151.0, 1151.0, 0.004889577620822336, 0.06152593447250014, 0.010413204125371564], "isController": false}, {"data": ["5.5 Consent agree", 14, 0, 0.0, 674.7857142857142, 430, 2827, 485.0, 1801.0, 2827.0, 2827.0, 0.00488664211943442, 0.07702494650435801, 0.007529369264521966], "isController": false}, {"data": ["1.5 Open Sessions list", 76, 0, 0.0, 370.9473684210527, 309, 732, 347.5, 462.5, 508.79999999999956, 732.0, 0.024340742206879012, 0.308205140092181, 0.01464685646520539], "isController": false}, {"data": ["4.2 Vaccination batch", 1700, 0, 0.0, 539.8964705882356, 403, 4496, 480.0, 671.0, 774.9499999999998, 1273.2400000000007, 0.4953620994961002, 9.99996701380137, 0.8010051816696792], "isController": false}, {"data": ["5.0 Consent for hpv", 14, 14, 100.0, 4074.1428571428573, 3014, 6264, 3695.0, 6188.0, 6264.0, 6264.0, 0.004879781357910701, 0.40703047364639217, 0.056140631900315825], "isController": true}, {"data": ["5.7 Consent triage", 14, 14, 100.0, 394.49999999999994, 100, 2782, 185.5, 1659.0, 2782.0, 2782.0, 0.00488231187231778, 0.0015495618735383578, 0.004667757151366315], "isController": false}, {"data": ["2.2 Session register", 742, 0, 0.0, 1352.239892183288, 749, 5370, 1288.0, 1643.1000000000001, 1889.5000000000002, 2892.2700000000004, 0.210090576786407, 9.540666482359612, 0.1393081070683304], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 14, 100.0, 0.12779552715654952], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10955, 14, "400/Bad Request", 14, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.7 Consent triage", 14, 14, "400/Bad Request", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
