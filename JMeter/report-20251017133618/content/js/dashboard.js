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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5005642703983749, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.30544354838709675, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.45145631067961167, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8916666666666667, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8528336380255942, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6699288256227758, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.44072164948453607, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.45863309352517984, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48927875243664715, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4902654867256637, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5725806451612904, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.781934306569343, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.02075812274368231, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7247, 0, 0.0, 872.4167241617217, 0, 14404, 679.0, 1720.1999999999998, 2447.199999999999, 4228.3599999999915, 6.027468355167346, 1848.9503610674574, 21.42128293295762], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 496, 0, 0.0, 1600.582661290323, 1017, 4349, 1413.5, 2346.9, 2785.149999999999, 3725.419999999997, 0.4659976718906634, 162.94649895614407, 2.4172399790535923], "isController": false}, {"data": ["4.1 Vaccination questions", 515, 0, 0.0, 1207.8233009708745, 547, 2565, 1140.0, 1489.2, 1694.9999999999998, 2322.8399999999983, 0.4635955934113614, 161.28265296741688, 2.302302957526092], "isController": false}, {"data": ["Get Next Patient from STS", 556, 0, 0.0, 0.7266187050359717, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.4695418504509207, 0.1979477680083234, 0.29975369505579186], "isController": false}, {"data": ["2.0 Register attendance", 543, 0, 0.0, 4819.158379373846, 2633, 15871, 4380.0, 6754.000000000001, 7917.799999999988, 12513.559999999998, 0.46395386094200575, 734.100721423422, 7.684947566218092], "isController": true}, {"data": ["1.0 Login", 558, 0, 0.0, 3290.4856630824384, 1924, 7991, 3211.0, 3954.3000000000006, 4428.15, 5709.499999999979, 0.4691476562375199, 694.8210129175351, 7.742461859157333], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 125, 0, 0.0, 3570.560000000001, 1744, 6119, 3391.0, 4389.000000000001, 4855.799999999999, 6059.979999999999, 0.11430734776776039, 118.1471896638381, 1.6587353560856777], "isController": true}, {"data": ["2.5 Select patient", 540, 0, 0.0, 448.5851851851854, 306, 2512, 400.5, 607.7, 755.8999999999999, 1151.2000000000025, 0.47027840481565086, 169.63365427929398, 1.6715737006817293], "isController": false}, {"data": ["2.3 Search by first/last name", 547, 0, 0.0, 470.34552102376614, 308, 1892, 424.0, 619.5999999999999, 797.0, 1289.4399999999991, 0.4682806225135968, 168.4357816022003, 1.731584411060069], "isController": false}, {"data": ["4.0 Vaccination for flu", 126, 0, 0.0, 3542.1111111111118, 1654, 5317, 3397.5, 4405.1, 4697.349999999999, 5268.9400000000005, 0.11493644744211673, 120.34236223931775, 1.654912381483191], "isController": true}, {"data": ["4.0 Vaccination for hpv", 133, 0, 0.0, 3521.5639097744365, 1655, 6182, 3379.0, 4375.2, 4886.7, 6017.779999999999, 0.1226125131140075, 126.06580750567197, 1.7744837396678215], "isController": true}, {"data": ["1.2 Sign-in page", 562, 0, 0.0, 694.359430604983, 173, 2264, 576.5, 1178.7, 1269.9500000000003, 1696.7800000000004, 0.4705500160338662, 166.1543833222778, 1.9800200902145693], "isController": false}, {"data": ["Debug Sampler", 543, 0, 0.0, 0.6077348066298336, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.4690330232072012, 3.0441072570767407, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 194, 0, 0.0, 1140.4226804123703, 738, 3000, 1008.0, 1714.5, 2225.5, 2487.0000000000064, 0.17001288241944104, 59.220014381808184, 0.7446365016124934], "isController": false}, {"data": ["1.4 Open Sessions list", 556, 0, 0.0, 992.9334532374103, 478, 2928, 895.0, 1433.1000000000001, 1664.4499999999998, 2217.659999999997, 0.46924147453225656, 193.94918482348797, 1.6654073428484137], "isController": false}, {"data": ["4.2 Vaccination batch", 513, 0, 0.0, 823.2612085769985, 507, 2174, 781.0, 1028.0, 1252.0999999999992, 1691.3400000000001, 0.46502057240134625, 160.47803281312747, 2.0797718274696626], "isController": false}, {"data": ["1.1 Homepage", 565, 0, 0.0, 760.1398230088491, 491, 2394, 728.0, 986.8000000000001, 1151.2999999999993, 1878.0, 0.47088827029820146, 168.818902895442, 1.9635469515714334], "isController": false}, {"data": ["1.3 Sign-in", 558, 0, 0.0, 844.4247311827957, 399, 4433, 792.5, 1185.0, 1307.05, 2103.3999999999924, 0.4694784330189735, 166.5534088180649, 2.1555787005291305], "isController": false}, {"data": ["2.2 Session register", 548, 0, 0.0, 510.1697080291967, 301, 2065, 480.5, 665.4000000000001, 794.1999999999998, 1455.9099999999987, 0.46704996582353353, 175.27077032668782, 1.666706994648528], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 129, 0, 0.0, 3683.860465116278, 1944, 5835, 3522.0, 4631.0, 5149.0, 5825.099999999999, 0.1179232347166003, 120.2356892098869, 1.7020783813002087], "isController": true}, {"data": ["2.1 Open session", 554, 0, 0.0, 2960.5054151624554, 1134, 14404, 2526.5, 4525.0, 6106.25, 10256.250000000027, 0.46793227989445335, 165.65146174463567, 1.6657764260320693], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7247, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
