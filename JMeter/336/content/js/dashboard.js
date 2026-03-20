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

    var data = {"OkPercent": 99.99321987931386, "KoPercent": 0.0067801206861482135};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7429389715975082, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5274135876042908, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9988045427375971, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8538011695906432, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9988088147706968, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5073529411764706, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5072992700729927, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7466016548463357, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.39156626506024095, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.4973544973544973, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.9530927835051546, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7466076696165191, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.746226694288251, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.48183442525312686, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5072115384615384, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9729166666666667, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8251231527093597, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9984912492456246, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3118343195266272, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5024154589371981, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5023696682464455, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.44594594594594594, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4603174603174603, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.28703703703703703, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8445103857566766, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9990903577926016, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9964285714285714, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9923469387755102, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.41304347826086957, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29498, 2, 0.0067801206861482135, 518.3059190453547, 0, 60002, 186.0, 1237.0, 2178.0, 5267.920000000013, 7.883666607869235, 415.7303295654536, 61.537025793280925], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1678, 1, 0.05959475566150179, 810.6829558998819, 376, 1846, 792.0, 1091.0, 1197.1999999999998, 1457.6800000000003, 0.4693313762009835, 64.1306934879782, 16.04576381452642], "isController": true}, {"data": ["2.5 Select patient", 1673, 0, 0.0, 105.45606694560654, 57, 654, 92.0, 166.0, 216.29999999999995, 354.52, 0.4712684021437783, 11.87488582727182, 3.398635255615925], "isController": false}, {"data": ["7.1 Full name search", 171, 0, 0.0, 513.6900584795322, 222, 2283, 381.0, 983.8000000000006, 1467.0, 2252.04, 0.05072838244097856, 1.9066723633811982, 0.3743521354238668], "isController": false}, {"data": ["2.3 Search by first/last name", 1679, 0, 0.0, 104.18225134008347, 60, 632, 89.0, 156.0, 203.0, 326.20000000000005, 0.46973483622369006, 13.623156392621805, 3.512633531009913], "isController": false}, {"data": ["4.0 Vaccination for flu", 408, 0, 0.0, 728.1004901960778, 173, 2262, 699.0, 924.0, 1082.1499999999994, 1299.5499999999997, 0.11638806748454007, 6.12338540974305, 3.296858490295574], "isController": true}, {"data": ["4.0 Vaccination for hpv", 411, 0, 0.0, 722.5620437956206, 171, 1457, 700.0, 929.2, 1044.1999999999998, 1265.0, 0.11799592957107187, 5.744937194531219, 3.351280768120486], "isController": true}, {"data": ["1.2 Sign-in page", 3384, 0, 0.0, 722.5292553191485, 12, 14470, 175.0, 1591.0, 2764.25, 5878.050000000001, 0.9409519297022154, 63.373858500130545, 8.173283286695874], "isController": false}, {"data": ["7.2 First name search", 166, 0, 0.0, 1741.4759036144576, 954, 8204, 1259.0, 3058.5000000000027, 5802.6, 7440.200000000014, 0.04839514695798602, 6.45725196630794, 0.3567664473712981], "isController": false}, {"data": ["7.7 Due vaccination search", 189, 0, 0.0, 673.2275132275132, 534, 3926, 622.0, 840.0, 950.0, 1515.7999999999847, 0.057021504347965137, 7.485268054056688, 0.43197083506560036], "isController": false}, {"data": ["2.4 Patient attending session", 970, 1, 0.10309278350515463, 359.70309278350516, 126, 1249, 329.0, 490.0, 596.8999999999999, 873.3499999999995, 0.27254456314337727, 8.310528213841273, 2.391810399826386], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.1 Homepage", 3390, 0, 0.0, 725.802064896754, 26, 10851, 185.0, 1621.000000000001, 2736.3499999999995, 6019.440000000002, 0.9415280528144467, 73.77555678434841, 8.164931024477646], "isController": false}, {"data": ["1.3 Sign-in", 3379, 0, 0.0, 734.8961231133463, 55, 15904, 229.0, 1636.0, 2745.0, 6048.399999999999, 0.9408419519171012, 63.62687713753361, 8.430821577913632], "isController": false}, {"data": ["Run some searches", 1679, 1, 0.05955926146515783, 1404.7081596188204, 0, 60002, 1117.0, 2733.0, 3367.0, 6856.000000000001, 0.4700266339094403, 53.84815317316618, 3.514068410763386], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 416, 0, 0.0, 723.5192307692311, 186, 1531, 688.5, 954.2, 1035.75, 1304.1299999999999, 0.12007528951566651, 5.944337377611962, 3.4082745612056367], "isController": true}, {"data": ["2.1 Open session", 1680, 0, 0.0, 271.9029761904762, 107, 892, 246.5, 421.0, 513.8999999999996, 687.6600000000008, 0.4697396775404878, 10.732902856296846, 3.3912008898351407], "isController": false}, {"data": ["4.3 Vaccination confirm", 1624, 0, 0.0, 486.05541871921207, 323, 1858, 445.0, 656.5, 759.5, 1035.0, 0.46892478203948784, 9.92102180964036, 4.833314702398071], "isController": false}, {"data": ["4.1 Vaccination questions", 1657, 0, 0.0, 133.58599879299916, 72, 1233, 109.0, 206.0, 275.0999999999999, 416.9400000000005, 0.47226881415495375, 6.633455385542504, 4.4282140202310325], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3380, 0, 0.0, 2410.797337278111, 247, 34546, 950.0, 4670.8, 8302.849999999999, 18873.23, 0.9404021526862532, 239.25107504155298, 28.12798152302789], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 414, 0, 0.0, 748.0893719806763, 183, 1699, 706.0, 968.5, 1135.25, 1448.1500000000024, 0.11861104744441898, 6.306066169887405, 3.3756982321152305], "isController": true}, {"data": ["7.0 Open Children Search", 1688, 0, 0.0, 1308.9395734597135, 76, 11322, 1065.0, 2697.2000000000003, 3072.6499999999996, 6989.239999999982, 0.47117118977982797, 52.664075710692515, 3.3982173145224004], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.8 Year group search", 185, 0, 0.0, 1314.0594594594593, 1107, 3367, 1236.0, 1530.2000000000003, 1870.6999999999998, 3028.1599999999944, 0.0535943872481281, 7.268378343746578, 0.40804328901946607], "isController": false}, {"data": ["7.9 DOB search", 189, 0, 0.0, 990.6137566137565, 675, 3596, 871.0, 1402.0, 1758.5, 3061.3999999999965, 0.05506619160179393, 7.425642192615565, 0.41490874208204975], "isController": false}, {"data": ["7.4 Partial name search", 216, 0, 0.0, 2660.981481481483, 938, 11181, 1388.5, 6111.8, 6923.449999999995, 10408.819999999958, 0.062215493731789, 8.273462678282673, 0.45861705200668007], "isController": false}, {"data": ["Debug Sampler", 1679, 0, 0.0, 0.32340678975580595, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.46975257832333867, 2.6952027405369616, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1685, 0, 0.0, 454.21483679525227, 318, 1566, 403.0, 624.4000000000001, 685.0, 865.5599999999995, 0.46981619173407907, 38.705256008959545, 3.387722617244234], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1649, 0, 0.0, 118.17768344451194, 69, 572, 99.0, 176.0, 229.5, 343.5, 0.47121057683432793, 7.59108062306883, 4.177737398313958], "isController": false}, {"data": ["7.5 Needs Consent search", 181, 1, 0.5524861878453039, 3024.9999999999995, 2446, 60002, 2665.0, 2909.4, 3101.8, 14433.780000000379, 0.05084723860165037, 6.845142149460261, 0.38404199667624805], "isController": false}, {"data": ["2.2 Session register", 1680, 0, 0.0, 121.20654761904775, 57, 760, 91.0, 224.9000000000001, 298.7999999999993, 452.0, 0.46977711313015846, 17.05023470592372, 3.395600049732059], "isController": false}, {"data": ["7.6 Needs triage search", 196, 0, 0.0, 178.52040816326516, 119, 714, 153.0, 249.30000000000013, 314.84999999999957, 580.1400000000001, 0.055925427437185905, 3.0440035387099544, 0.4241698908198696], "isController": false}, {"data": ["7.3 Last name search", 184, 0, 0.0, 1449.586956521739, 946, 6175, 1253.5, 1993.0, 3144.5, 4975.650000000008, 0.05473942249909264, 7.327982201506524, 0.40366431067745984], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 50.0, 0.0033900603430741067], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 50.0, 0.0033900603430741067], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29498, 2, "504/Gateway Time-out", 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 970, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 181, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
