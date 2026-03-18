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

    var data = {"OkPercent": 99.96465431924219, "KoPercent": 0.035345680757811394};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7421669754708111, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5154733009708737, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9930133657351154, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8888888888888888, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9942667471333736, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.48081534772182255, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4839080459770115, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7451448583253741, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.37988826815642457, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.49673202614379086, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.9437555358724535, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7468253968253968, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7403508771929824, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4340659340659341, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4845758354755784, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9816816816816817, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8310516490354698, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.98740012292563, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.32010834926704906, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4844559585492228, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.45964432284541723, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4608433734939759, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.33136094674556216, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8426258992805755, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9920098340503996, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9888621312462372, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9835526315789473, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.3463687150837989, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 28292, 10, 0.035345680757811394, 800.2841439276057, 0, 60005, 177.0, 1256.0, 2027.0, 14824.990000000002, 7.402089496944663, 376.8129058912209, 57.71159241163841], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1648, 8, 0.4854368932038835, 869.1444174757276, 365, 3194, 830.0, 1203.1000000000001, 1411.1, 2080.2799999999997, 0.4625505283124147, 68.64571195285086, 16.262461875718174], "isController": true}, {"data": ["2.5 Select patient", 1646, 0, 0.0, 120.39428918590522, 54, 1428, 91.0, 200.0, 281.64999999999986, 596.1199999999999, 0.4633369833553367, 11.737916793924825, 3.344579149941309], "isController": false}, {"data": ["7.1 Full name search", 162, 0, 0.0, 450.12345679012344, 181, 2738, 318.5, 843.6000000000018, 1303.9499999999994, 2652.3200000000006, 0.04592901642160796, 1.6303402648169276, 0.3392478378454812], "isController": false}, {"data": ["2.3 Search by first/last name", 1657, 0, 0.0, 113.04948702474357, 58, 1153, 86.0, 164.0, 257.1999999999998, 585.8400000000001, 0.4638886353723343, 13.585781682096027, 3.4721518988393827], "isController": false}, {"data": ["4.0 Vaccination for flu", 417, 0, 0.0, 908.6115107913665, 182, 14850, 708.0, 1057.3999999999999, 1438.6999999999994, 8522.999999999989, 0.11904918244330033, 6.352937250856755, 3.3905277305550148], "isController": true}, {"data": ["4.0 Vaccination for hpv", 435, 0, 0.0, 1081.1310344827589, 174, 32271, 697.0, 1146.6000000000004, 1535.6, 17199.87999999998, 0.12411277200312593, 6.12703022236943, 3.5203911823260845], "isController": true}, {"data": ["1.2 Sign-in page", 3141, 0, 0.0, 1213.276663482964, 12, 18686, 167.0, 1868.8000000000002, 4889.499999999893, 15074.519999999997, 0.8722579484193137, 55.96791616888814, 7.564366545835615], "isController": false}, {"data": ["7.2 First name search", 179, 0, 0.0, 1518.9050279329615, 874, 6101, 1194.0, 2842.0, 3331.0, 5842.599999999997, 0.05133200826015177, 6.869221138757587, 0.37876959577907504], "isController": false}, {"data": ["7.7 Due vaccination search", 153, 0, 0.0, 855.3529411764703, 708, 1698, 818.0, 1000.4, 1083.1999999999985, 1530.6000000000024, 0.046284195852936055, 6.092973231890778, 0.3509042902386631], "isController": false}, {"data": ["2.4 Patient attending session", 1129, 8, 0.70859167404783, 354.65987599645695, 68, 2266, 312.0, 494.0, 604.5, 1066.5000000000007, 0.3175941832723791, 9.76993057119342, 2.7869273080995516], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 3150, 0, 0.0, 1211.8200000000008, 26, 18752, 164.0, 1890.6000000000004, 4953.899999999967, 15100.369999999997, 0.8747482668876401, 66.30969629729472, 7.573217731647226], "isController": false}, {"data": ["1.3 Sign-in", 3135, 0, 0.0, 1223.9799043062194, 54, 18815, 195.0, 1886.4, 4947.999999999997, 15251.0, 0.8729074584443146, 56.24161892025872, 7.817712852897552], "isController": false}, {"data": ["Run some searches", 1456, 2, 0.13736263736263737, 2616.846840659347, 120, 60005, 1132.0, 12856.899999999996, 14604.05, 15579.120000000006, 0.4062808338132805, 46.57550446159, 3.038787129893089], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 389, 0, 0.0, 901.7326478149093, 182, 32543, 707.0, 1101.0, 1468.0, 4220.100000000041, 0.11263840552663668, 5.680324398336455, 3.2076795802568907], "isController": true}, {"data": ["2.1 Open session", 1665, 0, 0.0, 250.23663663663677, 105, 1582, 224.0, 356.0, 442.39999999999964, 683.4799999999982, 0.4648237313034076, 10.76064102612421, 3.3568181859423345], "isController": false}, {"data": ["4.3 Vaccination confirm", 1607, 0, 0.0, 707.938394523958, 319, 37836, 440.0, 691.8000000000002, 919.5999999999999, 7624.120000000041, 0.46395727551122634, 9.9212899784218, 4.786439967154885], "isController": false}, {"data": ["4.1 Vaccination questions", 1627, 0, 0.0, 153.46711739397702, 72, 2004, 110.0, 236.20000000000005, 379.5999999999999, 1005.6400000000003, 0.464201160303183, 6.631622988984709, 4.356219597427464], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3138, 0, 0.0, 3885.5885914595315, 197, 49197, 927.0, 5672.5, 12451.949999999755, 45431.76, 0.8725020874153668, 216.5825769276513, 26.273493458528208], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 386, 0, 0.0, 1048.0000000000002, 193, 38325, 698.0, 1067.0, 1342.749999999999, 9952.609999999928, 0.11168810200538012, 6.021490648526657, 3.180691013346728], "isController": true}, {"data": ["7.0 Open Children Search", 1462, 0, 0.0, 2425.4281805745536, 76, 19068, 1070.0, 5437.2000000000035, 14556.5, 15321.409999999989, 0.4068221458170781, 45.446687383459505, 2.93688541020862], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 5.9814453125, 12.858072916666666], "isController": false}, {"data": ["7.8 Year group search", 149, 0, 0.0, 2011.8255033557052, 1730, 3748, 1870.0, 2457.0, 2866.5, 3743.5, 0.04350086811967352, 5.909581643721175, 0.33143923151337185], "isController": false}, {"data": ["7.9 DOB search", 166, 0, 0.0, 1020.5120481927711, 699, 4555, 866.5, 1376.1000000000004, 1916.4, 4518.150000000001, 0.0470646273884944, 6.367356450228447, 0.3549317031299395], "isController": false}, {"data": ["7.4 Partial name search", 169, 0, 0.0, 1887.4437869822484, 887, 12545, 1297.0, 3134.0, 5351.5, 8880.50000000006, 0.04929933682182053, 6.527787872483473, 0.36370766920830516], "isController": false}, {"data": ["Debug Sampler", 1657, 0, 0.0, 0.2842486421243214, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.4639057786925864, 2.627532269028396, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1668, 0, 0.0, 466.36151079136687, 319, 1718, 403.0, 645.2000000000003, 727.55, 976.0299999999993, 0.4651477973662261, 38.44584839686798, 3.35726088295607], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 1627, 0, 0.0, 133.4585125998769, 68, 1850, 101.0, 202.20000000000005, 289.1999999999998, 684.6000000000015, 0.4641368025396014, 7.573205091055825, 4.11879568712929], "isController": false}, {"data": ["7.5 Needs Consent search", 147, 2, 1.3605442176870748, 15212.55782312925, 12547, 60005, 14564.0, 15559.800000000001, 15929.0, 60004.52, 0.04559170119385127, 6.097934557823303, 0.34244538339054004], "isController": false}, {"data": ["2.2 Session register", 1661, 0, 0.0, 141.31125827814535, 59, 1656, 90.0, 266.0, 363.7999999999997, 627.6999999999982, 0.46455833815092357, 20.356510603051124, 3.358974819682982], "isController": false}, {"data": ["7.6 Needs triage search", 152, 0, 0.0, 193.8421052631579, 120, 1051, 157.5, 282.7000000000004, 427.2999999999999, 1021.3199999999999, 0.043642958108215585, 2.387181315782069, 0.33124211124819725], "isController": false}, {"data": ["7.3 Last name search", 179, 0, 0.0, 1567.6033519553073, 910, 4722, 1265.0, 2851.0, 3218.0, 4235.599999999993, 0.05030745160156161, 6.749558845894364, 0.37129301357373734], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 2, 20.0, 0.007069136151562279], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 80.0, 0.028276544606249118], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 28292, 10, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "504/Gateway Time-out", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1129, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 147, 2, "504/Gateway Time-out", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
