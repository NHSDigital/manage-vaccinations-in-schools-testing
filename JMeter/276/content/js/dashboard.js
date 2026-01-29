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

    var data = {"OkPercent": 99.95756318370427, "KoPercent": 0.04243681629573746};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7797397062181293, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9814814814814815, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.27920143027413585, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9823459006582884, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5370370370370371, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9851101846337106, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4121287128712871, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.43002257336343114, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.35185185185185186, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9691860465116279, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.6320400500625782, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9776422764227642, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9624344787419918, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4225, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6132580261593341, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.46296296296296297, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.48091133004926107, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9715496368038741, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.37037037037037035, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.44379732090856144, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.42768079800498754, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5178571428571429, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.759478672985782, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9684466019417476, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9764740917212626, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9629629629629629, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21208, 9, 0.04243681629573746, 308.885420596001, 0, 9367, 123.0, 755.0, 1016.9500000000007, 1752.9600000000064, 5.5318583971539415, 2170.8081777730467, 41.53043470102585], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 142.6296296296296, 80, 823, 96.0, 295.79999999999995, 627.7999999999989, 823.0, 0.007858434093496156, 3.338268942318803, 0.05775670511793618], "isController": false}, {"data": ["2.0 Register attendance", 1678, 8, 0.4767580452920143, 1531.8069129916555, 509, 5067, 1422.5, 2341.2000000000003, 2690.45, 3465.300000000001, 0.46965781034221205, 894.6384650888103, 15.451732721655116], "isController": true}, {"data": ["2.5 Select patient", 1671, 0, 0.0, 135.5924596050268, 68, 1760, 92.0, 200.39999999999986, 361.0, 939.3999999999999, 0.4687810346510822, 197.6711932064132, 3.3417579699088025], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 1189.8888888888891, 305, 5300, 650.0, 4115.999999999999, 5162.4, 5300.0, 0.007853190707755723, 3.3983194408208273, 0.05730545519711073], "isController": false}, {"data": ["2.3 Search by first/last name", 1679, 0, 0.0, 138.10899344848107, 78, 1692, 100.0, 190.0, 327.0, 874.2000000000021, 0.4700741395669438, 199.82662292248017, 3.4761766845151585], "isController": false}, {"data": ["4.0 Vaccination for flu", 404, 0, 0.0, 1139.4108910891082, 194, 2845, 1006.0, 1748.5, 2008.0, 2701.899999999999, 0.11480227581303597, 141.6821027501148, 3.221575039093869], "isController": true}, {"data": ["4.0 Vaccination for hpv", 443, 0, 0.0, 1125.2167042889396, 192, 3867, 955.0, 1684.2000000000005, 2034.1999999999991, 3106.56, 0.12656119519478853, 156.2061316162686, 3.5591226547789137], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2067.3703703703713, 615, 9367, 1204.0, 5710.199999999999, 8504.599999999995, 9367.0, 0.007866477327355589, 4.0606202283077515, 0.057340382983818945], "isController": false}, {"data": ["1.2 Sign-in page", 1720, 0, 0.0, 180.08255813953488, 18, 6330, 108.0, 331.8000000000002, 516.8999999999996, 1351.8599999999988, 0.47818503203005674, 200.44327514636421, 4.012310651672369], "isController": false}, {"data": ["2.4 Patient attending session", 799, 8, 1.0012515644555695, 653.3779724655816, 130, 2989, 546.0, 983.0, 1204.0, 2127.0, 0.22762598913320936, 97.19738043733035, 1.9720150058302452], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 9.219898897058822, 17.348345588235293], "isController": false}, {"data": ["1.1 Homepage", 1722, 0, 0.0, 162.91811846689887, 35, 6408, 108.0, 222.4000000000001, 401.8499999999999, 1128.0899999999997, 0.47844895849830377, 200.34666987881445, 4.006009351565517], "isController": false}, {"data": ["1.3 Sign-in", 1717, 0, 0.0, 201.99068142108356, 76, 5910, 115.0, 364.20000000000005, 623.8999999999992, 1277.479999999999, 0.47797501167795675, 200.5645425745907, 4.1710589675398735], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 8917.296296296296, 4841, 21568, 6508.0, 19444.0, 20926.399999999998, 21568.0, 0.007842112142203634, 29.598282926886828, 0.4594964892025734], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 400, 0, 0.0, 1152.917499999999, 205, 4245, 1026.5, 1646.9000000000008, 1993.2499999999998, 3077.740000000001, 0.1150275102669242, 142.36915236533227, 3.22814681973018], "isController": true}, {"data": ["2.1 Open session", 1682, 0, 0.0, 788.8198573127227, 122, 4780, 692.0, 1456.7, 1704.85, 2298.17, 0.46945840911095404, 196.8370380875173, 3.35010289332702], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1544.7777777777774, 349, 7342, 882.0, 4512.999999999998, 6875.999999999997, 7342.0, 0.007888200245761262, 4.076669134042142, 0.057491022515991135], "isController": false}, {"data": ["4.3 Vaccination confirm", 1624, 0, 0.0, 783.565886699506, 486, 4274, 655.0, 1179.5, 1475.0, 2494.75, 0.4678475784854645, 196.05145776904982, 4.767864095121854], "isController": false}, {"data": ["4.1 Vaccination questions", 1652, 0, 0.0, 184.1755447941885, 84, 2028, 123.5, 324.4000000000001, 538.0999999999976, 1020.7000000000003, 0.4694408765927458, 192.39041086599693, 4.354932110718568], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1547.7037037037037, 670, 5515, 1099.0, 3355.5999999999995, 4805.7999999999965, 5515.0, 0.007885009691260986, 4.076260824913652, 0.0574977142598064], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1717, 1, 0.05824111822947001, 1063.8538147932454, 386, 18648, 913.0, 1538.2000000000007, 1893.6999999999994, 2825.2999999999993, 0.4781306067914596, 826.0229443299127, 15.537170075174691], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 401, 0, 0.0, 1130.4638403990032, 212, 4500, 965.0, 1715.2000000000003, 2041.599999999999, 3077.78, 0.11497881493829995, 142.08959272105966, 3.229978034763314], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1200.5, 279, 5797, 680.0, 3536.8000000000015, 5163.849999999996, 5797.0, 0.007838006324711246, 4.012433772345666, 0.05586957807662043], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2142.962962962963, 1791, 4320, 1997.0, 2646.4, 3702.399999999997, 4320.0, 0.007855278994780312, 4.062583064574903, 0.05792529553305196], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 123.85185185185185, 84, 436, 101.0, 176.59999999999997, 345.99999999999955, 436.0, 0.007855896097336298, 3.3371907995672854, 0.05787614366935522], "isController": false}, {"data": ["Debug Sampler", 1679, 0, 0.0, 0.27992852888624176, 0, 13, 0.0, 1.0, 1.0, 1.0, 0.4700994096458575, 2.6447206846715114, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1688, 1, 0.05924170616113744, 527.9383886255921, 308, 2338, 490.0, 803.1000000000001, 904.55, 1340.289999999996, 0.47044331199895206, 224.94412119393454, 3.352796949922034], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 1648, 0, 0.0, 180.57038834951467, 84, 2441, 113.0, 320.2000000000003, 565.55, 1152.2499999999993, 0.4693499929796861, 193.67910249460732, 4.114489238164933], "isController": false}, {"data": ["2.2 Session register", 1679, 0, 0.0, 158.40321620011918, 75, 1864, 100.0, 306.0, 450.0, 1001.0000000000011, 0.47001281827692015, 202.8695410283014, 3.3581863866763824], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 158.11111111111111, 79, 589, 103.0, 461.9999999999999, 583.0, 589.0, 0.007857313514666548, 3.337792919556533, 0.05764104505252614], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 88.88888888888889, 0.03772161448509996], "isController": false}, {"data": ["Assertion failed", 1, 11.11111111111111, 0.004715201810637495], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21208, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 799, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1688, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
