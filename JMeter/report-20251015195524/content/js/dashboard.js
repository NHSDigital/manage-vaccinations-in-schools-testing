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

    var data = {"OkPercent": 99.91439984782195, "KoPercent": 0.08560015217804831};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4098536167562096, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.04937044400265076, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.001625487646293888, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7210051546391752, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6913461538461538, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.380089058524173, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4093167701863354, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.3414322250639386, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4774509803921569, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4813172894236859, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3392743475493316, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6193982074263764, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.43378119001919385, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21028, 18, 0.08560015217804831, 977.186227886624, 0, 4901, 928.5, 1838.0, 2014.0, 2499.0, 5.838605376303781, 1970.066557102143, 20.933923843794815], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1509, 0, 0.0, 1892.2876076872103, 1288, 4901, 1797.0, 2412.0, 2726.0, 3662.0000000000036, 0.43650324166572413, 170.82881747928997, 2.2642277973088953], "isController": false}, {"data": ["4.1 Vaccination questions", 1538, 0, 0.0, 1837.157347204158, 1014, 3462, 1778.0, 2019.0, 2214.2999999999997, 2575.5399999999986, 0.43857647998174976, 167.81389210560553, 2.180088896483261], "isController": false}, {"data": ["Get Next Patient from STS", 1564, 0, 0.0, 0.5287723785166245, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.43671463267664185, 0.18380050839279521, 0.2788063705502716], "isController": false}, {"data": ["2.0 Register attendance", 1559, 18, 1.1545862732520846, 3657.146889031434, 2153, 7890, 3622.0, 4626.0, 4970.0, 5652.800000000004, 0.436616160343154, 779.5114531180598, 7.53604219887138], "isController": true}, {"data": ["1.0 Login", 1569, 0, 0.0, 4721.450605481206, 2685, 7752, 4673.0, 5319.0, 5602.0, 6245.5999999999985, 0.4366282393001036, 705.3027483490082, 7.253901388719213], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 381, 0, 0.0, 4808.574803149606, 2440, 8350, 4711.0, 5412.2, 5641.3, 6528.400000000001, 0.10910053055502103, 126.13906956128844, 1.591905107522725], "isController": true}, {"data": ["2.5 Select patient", 1552, 0, 0.0, 577.9452319587631, 443, 1980, 513.0, 767.4000000000001, 899.0499999999997, 1165.2300000000002, 0.4374509911139949, 172.41542916220033, 1.5548889900286824], "isController": false}, {"data": ["2.3 Search by first/last name", 1560, 0, 0.0, 602.7987179487193, 437, 1891, 592.0, 793.9000000000001, 906.9499999999998, 1198.849999999998, 0.4366350218233543, 172.31175091553408, 1.6145054440130342], "isController": false}, {"data": ["4.0 Vaccination for flu", 390, 0, 0.0, 4844.192307692307, 2621, 7319, 4745.5, 5539.200000000001, 5864.35, 6534.919999999998, 0.11138637190595792, 128.39128494194057, 1.6189474760776346], "isController": true}, {"data": ["4.0 Vaccination for hpv", 377, 0, 0.0, 4851.872679045092, 2806, 7528, 4745.0, 5497.0, 5795.299999999999, 6619.639999999992, 0.10829617654172677, 124.91691854684053, 1.580702604300421], "isController": true}, {"data": ["1.2 Sign-in page", 1572, 0, 0.0, 1099.4860050890607, 305, 2644, 876.5, 1857.0, 1930.0499999999997, 2287.81, 0.43779081619580945, 170.70786378490004, 1.8701558773417075], "isController": false}, {"data": ["2.4 Patient attending session", 805, 18, 2.2360248447204967, 1269.2248447204963, 452, 3565, 1178.0, 1682.4, 1886.3999999999999, 2682.039999999999, 0.22642118672266162, 89.43404691649151, 0.9880692405306019], "isController": false}, {"data": ["Debug Sampler", 1559, 0, 0.0, 0.48428479794740253, 0, 8, 0.0, 1.0, 1.0, 1.0, 0.43826247902510634, 2.814571453036198, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1564, 0, 0.0, 1365.770460358057, 656, 3241, 1180.5, 2095.0, 2213.0, 2584.149999999999, 0.43662429121835206, 195.17873321097244, 1.5514778495178847], "isController": false}, {"data": ["4.2 Vaccination batch", 1530, 0, 0.0, 1134.1071895424832, 689, 2471, 1150.0, 1323.0, 1484.3500000000001, 1909.800000000001, 0.4376643028980242, 168.6147710830654, 1.9594774345434418], "isController": false}, {"data": ["1.1 Homepage", 1579, 0, 0.0, 1001.7194426852428, 685, 3168, 927.0, 1349.0, 1447.0, 1884.200000000002, 0.4385407009652339, 170.81261821669673, 1.8651814917806253], "isController": false}, {"data": ["1.3 Sign-in", 1571, 0, 0.0, 1258.2940802036926, 599, 4092, 1118.0, 1871.8, 1953.3999999999999, 2302.7199999999993, 0.4373777270334236, 170.71345847511222, 1.9886694986422082], "isController": false}, {"data": ["2.2 Session register", 1562, 0, 0.0, 671.1696542893716, 432, 2508, 619.5, 912.7, 1017.8499999999999, 1350.1399999999976, 0.43667353174116164, 174.8532925362513, 1.5591674420394164], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 382, 0, 0.0, 4846.63612565445, 2807, 8067, 4735.5, 5544.8, 5922.099999999999, 7204.100000000004, 0.11015610446489797, 127.0347254728566, 1.6011153512840683], "isController": true}, {"data": ["2.1 Open session", 1563, 0, 0.0, 1151.7044145873338, 573, 3756, 1105.0, 1579.2000000000003, 1770.8, 2304.3599999999997, 0.4364230952979949, 168.9432690572291, 1.5544387900553611], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, 100.0, 0.08560015217804831], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21028, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 805, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
