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

    var data = {"OkPercent": 99.99075529259498, "KoPercent": 0.009244707405010632};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.34906729099010647, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.6148775894538606, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.572, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.4295415959252971, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5659340659340659, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [9.9601593625498E-4, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.6, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.1750936329588015, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.5454545454545454, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9428571428571428, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.07094594594594594, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.10081348053457292, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.4567444507683551, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5454545454545454, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.5454545454545454, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5558823529411765, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.6103773584905661, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.8450704225352113, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.4600684540787222, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.38091216216216217, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10817, 1, 0.009244707405010632, 1230.2238143662755, 0, 15297, 976.0, 2286.0, 2921.500000000002, 4917.0, 3.0042916070918726, 77.75606199569728, 4.071167768036581], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 2, 0, 0.0, 9167.5, 8015, 10320, 9167.5, 10320.0, 10320.0, 10320.0, 8.826148701188088E-4, 0.20140297356811182, 0.01397272427685157], "isController": true}, {"data": ["2.0 Register attendance", 587, 0, 0.0, 7340.942078364562, 2939, 16936, 6925.0, 9863.2, 11730.200000000003, 15011.400000000001, 0.1674303238849768, 40.82002119717459, 0.6824352237890252], "isController": true}, {"data": ["2.5 Select patient", 531, 0, 0.0, 751.5875706214687, 427, 3901, 574.0, 1135.4, 1489.5999999999995, 2962.239999999999, 0.15204078243450794, 3.57068564952624, 0.1054189018833014], "isController": false}, {"data": ["2.5 Select menacwy", 375, 0, 0.0, 812.7946666666666, 430, 5067, 617.0, 1220.8000000000002, 1627.5999999999995, 3155.560000000002, 0.11595930972360557, 3.003332230882407, 0.08085444056899842], "isController": false}, {"data": ["2.3 Search by first/last name", 589, 0, 0.0, 1127.7266553480472, 633, 5595, 946.0, 1699.0, 2064.0, 4256.100000000007, 0.16763509852048505, 11.049065658455868, 0.13086958759560038], "isController": false}, {"data": ["2.5 Select td_ipv", 364, 0, 0.0, 819.8653846153846, 426, 6375, 652.0, 1261.5, 1561.0, 3218.0000000000105, 0.11614205449551114, 3.0455045626438015, 0.08086844224150337], "isController": false}, {"data": ["4.0 Vaccination for flu", 522, 0, 0.0, 4135.448275862072, 1638, 16934, 3729.0, 5676.099999999999, 6764.849999999999, 9562.089999999993, 0.15193167149578476, 7.425749694208405, 0.9097660917141938], "isController": true}, {"data": ["4.0 Vaccination for hpv", 502, 0, 0.0, 4118.374501992032, 1483, 12820, 3784.5, 5737.2, 6921.999999999999, 9522.919999999991, 0.15089298891657932, 7.085946184049319, 0.9089482055118925], "isController": true}, {"data": ["5.8 Consent confirm", 11, 1, 9.090909090909092, 2235.0909090909095, 159, 3754, 2205.0, 3628.8000000000006, 3754.0, 3754.0, 0.0044417004606043375, 0.41306749600448855, 0.009155092293488185], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 162.58571428571443, 156, 288, 159.0, 166.9, 173.45, 288.0, 0.07875911636771957, 0.4732469170025181, 0.047455444139534154], "isController": false}, {"data": ["Get correct patient name", 589, 0, 0.0, 0.5127334465195243, 0, 119, 0.0, 1.0, 1.0, 1.0, 0.16767537591737505, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 10, 0, 0.0, 698.1, 443, 1203, 630.0, 1186.5, 1203.0, 1203.0, 0.004042800318410953, 0.10932261099306134, 0.0030178872689388013], "isController": false}, {"data": ["2.4 Patient attending session", 534, 0, 0.0, 1910.5411985018734, 1143, 8365, 1646.0, 2841.0, 3361.25, 5409.749999999988, 0.1524432455795027, 10.303821170423697, 0.2265806833710968], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 186.0, 186, 186, 186.0, 186.0, 186.0, 186.0, 5.376344086021506, 25.80015120967742, 3.9272513440860215], "isController": false}, {"data": ["5.4 Consent route", 11, 0, 0.0, 700.9090909090909, 173, 1410, 645.0, 1299.4000000000003, 1410.0, 1410.0, 0.0044520840407762325, 0.051677612933182716, 0.00670065525064626], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 507.61428571428564, 463, 1704, 473.5, 506.7, 542.35, 1704.0, 0.07886852954133444, 0.4419410376056416, 0.04274612685101622], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 1093.0428571428572, 956, 1457, 1065.5, 1272.4, 1383.8000000000002, 1457.0, 0.0787197027544024, 1.215312285980808, 0.17412121751828266], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 356, 0, 0.0, 4159.095505617977, 1921, 11746, 3776.5, 5693.300000000003, 7058.249999999998, 9669.69, 0.11642928392719899, 6.0113966838299016, 0.7030783700309061], "isController": true}, {"data": ["2.1 Open session", 592, 0, 0.0, 2502.2972972972984, 1118, 9405, 2189.5, 3954.5000000000027, 5042.6, 7344.700000000005, 0.1680101805087757, 3.010101842691387, 0.1097206740287479], "isController": false}, {"data": ["4.3 Vaccination confirm", 1721, 0, 0.0, 2174.9692039511933, 1152, 15297, 1910.0, 3179.0, 3963.499999999998, 6412.599999999999, 0.5081168792825307, 11.075407100139916, 1.1826456232971736], "isController": false}, {"data": ["5.6 Consent questions", 11, 0, 0.0, 758.0909090909091, 168, 1564, 650.0, 1445.2000000000005, 1564.0, 1564.0, 0.004453630619925139, 0.05305925201273738, 0.010747388806001875], "isController": false}, {"data": ["4.1 Vaccination questions", 1757, 0, 0.0, 1036.9328400682991, 581, 10625, 935.0, 1412.4, 1846.0, 4004.8400000000074, 0.5104344183284595, 6.394641620639446, 1.0773617564674394], "isController": false}, {"data": ["5.3 Consent parent details", 11, 0, 0.0, 806.1818181818181, 175, 1378, 728.0, 1329.6000000000001, 1378.0, 1378.0, 0.004458126841003743, 0.049456553071568335, 0.007846049937505168], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 11, 0, 0.0, 810.0909090909091, 196, 1236, 756.0, 1234.2, 1236.0, 1236.0, 0.004468418638830314, 0.06451239739901475, 0.006732777089686443], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2317.057142857143, 2012, 4883, 2184.5, 2597.1, 3321.3500000000013, 4883.0, 0.07868448533040177, 3.4449051233716528, 0.31112644638945], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 372, 0, 0.0, 4117.258064516128, 1604, 12314, 3827.5, 5697.0999999999985, 6431.249999999994, 10914.589999999998, 0.11659102875912043, 5.883207527525826, 0.7022460251900873], "isController": true}, {"data": ["5.0 Consent for td_ipv", 2, 0, 0.0, 10371.0, 8605, 12137, 10371.0, 12137.0, 12137.0, 12137.0, 8.777982012159261E-4, 0.20050445348174267, 0.014075631312466315], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 510, 0, 0.0, 906.0235294117643, 433, 5120, 893.0, 1284.3000000000002, 1787.1499999999999, 3968.2099999999864, 0.15189149586319042, 3.744892625183908, 0.11317696420274835], "isController": false}, {"data": ["2.5 Select flu", 530, 0, 0.0, 766.7415094339618, 430, 4060, 602.0, 1129.6000000000001, 1516.9999999999998, 3417.4699999999666, 0.1522985442270662, 3.693184695821014, 0.10559762343868849], "isController": false}, {"data": ["5.1 Consent start", 11, 0, 0.0, 1080.8181818181818, 192, 1882, 1091.0, 1780.4000000000003, 1882.0, 1882.0, 0.0044698276475093925, 0.054727610988868094, 0.009036480396758155], "isController": false}, {"data": ["5.5 Consent agree", 11, 0, 0.0, 1048.9090909090912, 478, 4109, 733.0, 3504.800000000002, 4109.0, 4109.0, 0.00445350079575962, 0.07200801544109699, 0.006618177363300805], "isController": false}, {"data": ["1.5 Open Sessions list", 71, 0, 0.0, 552.1549295774647, 427, 3167, 460.0, 586.8, 843.7999999999957, 3167.0, 0.08010912894297698, 1.3402632783701967, 0.047936119809972116], "isController": false}, {"data": ["4.2 Vaccination batch", 1753, 0, 0.0, 957.9623502567023, 571, 7469, 756.0, 1378.2000000000003, 1794.3, 3957.4600000000037, 0.5101098060098676, 7.795804875178779, 0.8258815389646197], "isController": false}, {"data": ["5.0 Consent for hpv", 3, 0, 0.0, 10180.333333333334, 8890, 12710, 8941.0, 12710.0, 12710.0, 12710.0, 0.0016210581943681196, 0.3662799986950481, 0.02553905419629826], "isController": true}, {"data": ["5.7 Consent triage", 11, 0, 0.0, 1111.1818181818182, 458, 4004, 751.0, 3454.000000000002, 4004.0, 4004.0, 0.004450678991540878, 0.07000178381190945, 0.00711895271578409], "isController": false}, {"data": ["5.0 Consent for flu", 4, 1, 25.0, 7856.75, 1999, 11270, 9079.0, 11270.0, 11270.0, 11270.0, 0.0024705083070841825, 0.4492899218701748, 0.03357140927058242], "isController": true}, {"data": ["2.2 Session register", 592, 0, 0.0, 1287.601351351352, 639, 7959, 1140.0, 1855.2000000000003, 2228.500000000001, 3302.390000000034, 0.16800217040641768, 12.931234651533133, 0.11119202452973581], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 1, 100.0, 0.009244707405010632], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10817, 1, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.8 Consent confirm", 11, 1, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
