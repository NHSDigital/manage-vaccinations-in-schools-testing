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

    var data = {"OkPercent": 96.30720329079605, "KoPercent": 3.6927967092039453};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8258123085070167, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.46117084826762245, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9945978391356542, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6730769230769231, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9979116945107399, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4918793503480278, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.2699530516431925, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.1346153846153846, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9830409356725146, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7622345337026778, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9853801169590644, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9836161497952018, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5012853470437018, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9708333333333333, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.2692307692307692, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.6633601983880967, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8733211233211233, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.21153846153846154, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.483908718548859, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5038560411311054, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.3269230769230769, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7592152199762188, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8776758409785933, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9955277280858676, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21393, 790, 3.6927967092039453, 207.87112606927485, 0, 8493, 106.0, 496.0, 600.9500000000007, 1051.9900000000016, 5.450412532509355, 152.89459754736532, 41.084934637899664], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 104.96153846153847, 73, 274, 93.0, 168.9, 237.94999999999985, 274.0, 0.007506850723097396, 0.22743411800134142, 0.055795265750455535], "isController": false}, {"data": ["2.0 Register attendance", 1674, 212, 12.664277180406213, 816.1344086021502, 265, 3239, 795.5, 1196.0, 1385.0, 1712.75, 0.46911229046177577, 62.60066679879132, 16.226570088220573], "isController": true}, {"data": ["2.5 Select patient", 1666, 0, 0.0, 116.2527010804323, 47, 1106, 95.0, 196.5999999999999, 271.64999999999986, 520.6399999999994, 0.4678613512824344, 11.323888593657502, 3.3740211831879385], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 693.1153846153845, 188, 2134, 558.0, 1626.6000000000004, 2081.85, 2134.0, 0.0075045344706359115, 0.2904458351024311, 0.05537610192182468], "isController": false}, {"data": ["2.3 Search by first/last name", 1676, 0, 0.0, 107.97732696897376, 55, 784, 89.0, 176.29999999999995, 253.14999999999986, 451.07000000000016, 0.4696746018134596, 13.423693128143542, 3.5121530361198268], "isController": false}, {"data": ["4.0 Vaccination for flu", 431, 2, 0.46403712296983757, 810.8027842227373, 65, 2789, 756.0, 1088.6, 1276.9999999999998, 2056.4800000000014, 0.12299178808657596, 6.449215797153725, 3.484788044003237], "isController": true}, {"data": ["4.0 Vaccination for hpv", 426, 191, 44.83568075117371, 504.591549295774, 49, 2008, 575.5, 1019.2, 1180.5499999999997, 1702.7300000000018, 0.12198897002078107, 4.368848279780128, 3.1572252406060617], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 2093.3076923076924, 937, 8097, 1617.5, 4290.900000000001, 6817.049999999995, 8097.0, 0.007506725015092848, 1.0045886593487166, 0.0553401046278671], "isController": false}, {"data": ["1.2 Sign-in page", 1710, 0, 0.0, 150.69707602339182, 11, 7648, 90.0, 231.0, 380.34999999999945, 1136.599999999995, 0.47566394759351593, 10.161960825092665, 4.035988113182289], "isController": false}, {"data": ["2.4 Patient attending session", 1083, 212, 19.575253924284397, 297.28347183748826, 13, 1375, 311.0, 478.6, 578.0, 877.680000000006, 0.3084343553152381, 8.004298881701185, 2.616528419142923], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 1710, 0, 0.0, 145.34269005847943, 28, 7921, 93.0, 204.9000000000001, 302.89999999999964, 1157.4899999999948, 0.47563589877244217, 18.31447213967938, 4.027135629958192], "isController": false}, {"data": ["1.3 Sign-in", 1709, 0, 0.0, 158.43768285547105, 51, 7559, 93.0, 275.0, 357.0, 1091.3000000000025, 0.47627779843165535, 10.378538845589288, 4.202959102256759], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 9290.576923076922, 5278, 22233, 8517.5, 12299.900000000001, 19024.199999999986, 22233.0, 0.007490056230156752, 4.96477071857583, 0.44385306884528397], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 389, 0, 0.0, 800.2519280205654, 197, 1996, 758.0, 1096.0, 1243.0, 1549.1, 0.11208924263114081, 5.585712024852548, 3.1832032487006723], "isController": true}, {"data": ["2.1 Open session", 1680, 0, 0.0, 279.8101190476184, 85, 1449, 256.0, 437.0, 533.7999999999993, 802.5700000000002, 0.46919812086152596, 10.78590399413977, 3.3871322122977663], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 2140.307692307692, 725, 7972, 1463.0, 5322.1, 7056.0499999999965, 7972.0, 0.0075063392478474855, 0.9829966259005081, 0.0553299303151883], "isController": false}, {"data": ["4.3 Vaccination confirm", 1613, 191, 11.841289522628642, 469.3273403595784, 13, 2111, 479.0, 729.0, 869.5999999999999, 1255.3199999999988, 0.4651826772085002, 9.091517758972358, 4.635714337857305], "isController": false}, {"data": ["4.1 Vaccination questions", 1638, 194, 11.843711843711844, 133.7545787545788, 17, 1204, 107.0, 237.0, 307.04999999999995, 605.7099999999989, 0.46613850915928023, 6.228075611515101, 4.287928917505721], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 2068.3461538461543, 924, 6057, 1709.0, 4103.300000000001, 5711.549999999998, 6057.0, 0.007505513665808344, 1.0060923436182927, 0.05537684354179417], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1709, 0, 0.0, 938.9789350497375, 448, 23128, 816.0, 1181.0, 1361.5, 3583.300000000025, 0.4760688358208789, 77.4129245089304, 15.649793438286688], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 389, 0, 0.0, 780.8123393316193, 200, 1846, 734.0, 1069.0, 1193.5, 1593.9000000000028, 0.11158156397194799, 5.9474153459143215, 3.166024073955486], "isController": true}, {"data": ["7.0 Open Children Search", 26, 0, 0.0, 2029.615384615384, 166, 8493, 1137.5, 5774.300000000001, 7999.849999999998, 8493.0, 0.007515141565034012, 0.9429921955254847, 0.054190933859672656], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 1952.615384615385, 1712, 3412, 1840.5, 2263.4, 3102.5999999999985, 3412.0, 0.007506642656958846, 1.009096453934188, 0.05597698692530515], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 110.65384615384613, 75, 201, 101.0, 170.0, 192.59999999999997, 201.0, 0.007506727182436568, 0.22743037510538291, 0.05592630171341048], "isController": false}, {"data": ["Debug Sampler", 1676, 0, 0.0, 0.26431980906921276, 0, 16, 0.0, 1.0, 1.0, 1.0, 0.46968578973489933, 2.5896273735281334, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1682, 0, 0.0, 492.20927467300874, 305, 2166, 493.5, 688.0, 779.8499999999999, 1022.380000000001, 0.46889631230613077, 38.560781152734336, 3.3810878072114137], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1635, 193, 11.80428134556575, 124.52599388379191, 14, 871, 102.0, 213.0, 296.1999999999998, 498.0, 0.4663823873472598, 7.01743786765052, 4.052435183723284], "isController": false}, {"data": ["2.2 Session register", 1677, 0, 0.0, 119.74597495527743, 54, 980, 89.0, 221.4000000000001, 298.0999999999999, 488.7600000000002, 0.4690052418397423, 16.633765697831976, 3.3898580356336314], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 127.26923076923076, 77, 318, 96.0, 221.8, 288.2499999999999, 318.0, 0.00750931371515498, 0.227508738963836, 0.055710905736595796], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 193, 24.430379746835442, 0.9021642593371664], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 194, 24.556962025316455, 0.9068386855513486], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 212, 26.835443037974684, 0.9909783574066283], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 191, 24.17721518987342, 0.8928154069088019], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21393, 790, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 212, "Test failed: text expected to contain /Which batch did you use?/", 194, "Test failed: text expected to contain /Check and confirm/", 193, "Test failed: text expected to contain /Vaccination outcome recorded for/", 191, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1083, 212, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 212, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1613, 191, "Test failed: text expected to contain /Vaccination outcome recorded for/", 191, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1638, 194, "Test failed: text expected to contain /Which batch did you use?/", 194, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1635, 193, "Test failed: text expected to contain /Check and confirm/", 193, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
