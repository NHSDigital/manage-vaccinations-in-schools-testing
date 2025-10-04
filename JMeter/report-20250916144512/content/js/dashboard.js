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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7070582428430404, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.030120481927710843, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9764150943396226, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.875, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.8975903614457831, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8076923076923077, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.4858490566037736, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4928571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6184738955823293, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4393939393939394, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.625, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [1.0, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.9294871794871795, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9878048780487805, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9450757575757576, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7791164658634538, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3465, 0, 0.0, 424.9036075036081, 0, 2348, 295.0, 984.4000000000001, 1101.3999999999996, 1529.7200000000012, 2.8286753390940893, 49.54893671476707, 2.4877898894755317], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 249, 0, 0.0, 2616.79518072289, 957, 4629, 2659.0, 3240.0, 3468.5, 4021.5, 0.2760284276023993, 41.99482246639991, 1.0877734545179423], "isController": true}, {"data": ["2.5 Select patient", 212, 0, 0.0, 292.080188679245, 241, 800, 265.0, 322.1, 455.0499999999994, 729.61, 0.23536621651027398, 5.4041205671770705, 0.16364873562822796], "isController": false}, {"data": ["Choose session", 249, 0, 0.0, 0.4819277108433737, 0, 47, 0.0, 1.0, 1.0, 1.0, 0.27680630006692264, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 52, 0, 0.0, 390.5, 244, 1279, 272.5, 728.4, 753.2999999999997, 1279.0, 0.06060895683826383, 1.422802318860808, 0.04545671762869788], "isController": false}, {"data": ["2.3 Search by first/last name", 249, 0, 0.0, 375.273092369478, 242, 1294, 280.0, 718.0, 733.5, 1128.5, 0.2763543862102491, 7.5059540358284025, 0.21602433867784956], "isController": false}, {"data": ["2.5 Select td_ipv", 52, 0, 0.0, 456.88461538461536, 252, 851, 302.5, 736.4, 810.0499999999997, 851.0, 0.060333715060107464, 1.48309694228442, 0.042068625539957744], "isController": false}, {"data": ["4.0 Vaccination for flu", 82, 0, 0.0, 2234.6219512195116, 2058, 2669, 2210.0, 2405.8, 2488.25, 2669.0, 0.09219170027353953, 4.203332396191583, 0.5544457690755309], "isController": true}, {"data": ["4.0 Vaccination for hpv", 78, 0, 0.0, 2267.807692307692, 2005, 3525, 2232.0, 2432.7000000000007, 2545.5499999999997, 3525.0, 0.08725027405534799, 3.7918137587669745, 0.5268137290543412], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 158.3142857142857, 150, 221, 157.0, 161.0, 173.45000000000005, 221.0, 0.0788122321087789, 0.46756280279378104, 0.047487448448356034], "isController": false}, {"data": ["Get correct patient name", 244, 0, 0.0, 0.614754098360656, 0, 48, 0.0, 1.0, 1.0, 1.0, 0.2709139459615502, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 212, 0, 0.0, 860.2641509433964, 683, 2055, 794.0, 1135.4000000000008, 1307.1999999999998, 1798.23, 0.23494157490646667, 6.727043473957503, 0.3496591407787648], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 159.0, 159, 159, 159.0, 159.0, 159.0, 159.0, 6.289308176100629, 29.966342374213838, 4.594143081761006], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 466.28571428571433, 441, 598, 463.5, 479.9, 493.65000000000003, 598.0, 0.07886790752174501, 0.43569897739307767, 0.04274578972125828], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 826.4142857142857, 742, 1566, 794.5, 912.4, 1024.5000000000002, 1566.0, 0.07881116731723409, 1.1687757684370284, 0.17432352927103048], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 52, 0, 0.0, 2402.807692307692, 2104, 3352, 2370.0, 2627.7000000000003, 2714.5499999999997, 3352.0, 0.06018873799263614, 2.904705692263085, 0.3654910475039615], "isController": true}, {"data": ["2.1 Open session", 249, 0, 0.0, 730.4457831325301, 433, 1619, 604.0, 1047.0, 1110.0, 1313.5, 0.2767995304412785, 4.45552515380994, 0.17870339915937428], "isController": false}, {"data": ["4.3 Vaccination confirm", 264, 0, 0.0, 1183.3333333333323, 903, 2348, 1079.0, 1524.0, 1616.75, 2224.2500000000014, 0.2589222752598785, 5.226664913444932, 0.6028110843252966], "isController": false}, {"data": ["4.1 Vaccination questions", 264, 0, 0.0, 653.5871212121215, 400, 1297, 713.0, 750.5, 783.5, 944.0000000000005, 0.26004113377934324, 2.969096329049057, 0.5460261648537662], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 70, 0, 0.0, 1726.8428571428574, 1592, 2429, 1692.5, 1837.0, 2134.35, 2429.0, 0.07875406567864067, 3.8734848807663447, 0.3114015741531407], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 52, 0, 0.0, 2302.942307692308, 2016, 3095, 2247.0, 2543.8, 2755.549999999999, 3095.0, 0.06048832691614224, 2.8578326203659543, 0.36466345734409716], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 389.0, 389, 389, 389.0, 389.0, 389.0, 389.0, 2.5706940874035986, 66.77528518637531, 1.6744657776349614], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 264.0, 264, 264, 264.0, 264.0, 264.0, 264.0, 3.787878787878788, 67.48638731060606, 2.467299952651515], "isController": false}, {"data": ["2.5 Select hpv", 78, 0, 0.0, 346.525641025641, 242, 1438, 266.0, 719.6, 766.35, 1438.0, 0.08745629988092489, 1.961130220958902, 0.0652505987392838], "isController": false}, {"data": ["2.5 Select flu", 82, 0, 0.0, 284.219512195122, 243, 710, 264.0, 337.6000000000001, 390.7, 710.0, 0.09238395673726904, 2.1381635695977916, 0.06892709272194682], "isController": false}, {"data": ["Debug Sampler", 462, 0, 0.0, 0.4718614718614717, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.45896532129559353, 3.036147648001415, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 70, 0, 0.0, 275.8285714285714, 249, 608, 265.0, 294.0, 337.40000000000015, 608.0, 0.07875220506174173, 1.803225539143221, 0.04706674755643158], "isController": false}, {"data": ["4.2 Vaccination batch", 264, 0, 0.0, 454.090909090909, 393, 826, 428.0, 527.0, 719.75, 772.2000000000016, 0.2598512154934319, 3.6923593146202727, 0.417728015442938], "isController": false}, {"data": ["2.2 Session register", 249, 0, 0.0, 528.2409638554211, 237, 2279, 410.0, 908.0, 1255.5, 1595.5, 0.2765302450790943, 15.796690472977776, 0.1809599885584223], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 122.0, 122, 122, 122.0, 122.0, 122.0, 122.0, 8.196721311475411, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3465, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
