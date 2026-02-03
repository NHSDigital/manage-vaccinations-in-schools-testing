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

    var data = {"OkPercent": 99.87591341513857, "KoPercent": 0.12408658486143664};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.49829989799387964, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1708595387840671, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4444444444444444, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7859884836852208, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7893258426966292, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5594149908592322, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4341772151898734, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4269870609981516, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48697394789579157, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.48628884826325414, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.48443223443223443, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7337057728119181, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5899814471243042, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7253, 9, 0.12408658486143664, 786.1864056252577, 0, 7851, 706.0, 1436.0, 1691.0, 2472.2200000000003, 6.037228884473593, 2043.519229061458, 21.596543463022496], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 477, 0, 0.0, 1772.6855345911945, 1070, 7028, 1615.0, 2320.4, 2896.3999999999996, 4860.4399999999805, 0.453774893405709, 177.56376070134618, 2.3538847964719714], "isController": false}, {"data": ["4.1 Vaccination questions", 504, 0, 0.0, 1356.5773809523816, 633, 5735, 1267.0, 1535.5, 1736.5, 2762.9999999999973, 0.4533637974615225, 173.46816224762523, 2.251384645787045], "isController": false}, {"data": ["Get Next Patient from STS", 541, 0, 0.0, 0.6081330868761554, 0, 1, 1.0, 1.0, 1.0, 1.0, 0.45701561202500157, 0.19224743710122008, 0.2917609234967692], "isController": false}, {"data": ["2.0 Register attendance", 525, 9, 1.7142857142857142, 3196.417142857143, 1506, 7225, 3191.0, 4030.8, 4467.9, 5521.88, 0.4497851312173156, 848.097069548133, 8.219425862398735], "isController": true}, {"data": ["1.0 Login", 546, 0, 0.0, 3704.102564102563, 2383, 12279, 3564.5, 4382.2, 4963.649999999999, 7532.919999999982, 0.4574829889223762, 736.4278917444219, 7.539210896568207], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 123, 0, 0.0, 3914.09756097561, 2004, 9095, 3825.0, 4721.6, 5313.2, 8887.880000000005, 0.11264674986651818, 128.54169620447993, 1.620160983538921], "isController": true}, {"data": ["2.5 Select patient", 521, 0, 0.0, 533.4203454894434, 337, 2705, 486.0, 690.8, 821.4999999999997, 1749.1199999999862, 0.4524097112653492, 178.30427976276275, 1.6080564259545973], "isController": false}, {"data": ["2.3 Search by first/last name", 534, 0, 0.0, 530.1067415730347, 329, 5184, 474.0, 677.0, 789.0, 1176.8499999999995, 0.45554161253200093, 179.8315370767899, 1.6843708106060153], "isController": false}, {"data": ["4.0 Vaccination for flu", 125, 0, 0.0, 4041.5200000000023, 1793, 9235, 3814.0, 4782.0, 6380.799999999995, 9118.779999999997, 0.11383941175077729, 130.4789032304096, 1.6436490016738947], "isController": true}, {"data": ["4.0 Vaccination for hpv", 126, 0, 0.0, 3919.9682539682553, 2103, 9009, 3742.0, 4930.599999999999, 5284.9, 8248.14000000001, 0.11489703948628256, 131.112155789044, 1.6570877339203416], "isController": true}, {"data": ["1.2 Sign-in page", 547, 0, 0.0, 813.0968921389399, 212, 7851, 655.0, 1301.0, 1402.0000000000002, 2807.9999999999986, 0.4582632743455506, 178.14781318697604, 1.9270680504730502], "isController": false}, {"data": ["2.4 Patient attending session", 395, 9, 2.278481012658228, 1180.8582278481008, 506, 3068, 1097.0, 1564.2000000000007, 1867.9999999999995, 2661.320000000001, 0.34176911808858484, 135.1714006263568, 1.4913268853433828], "isController": false}, {"data": ["Debug Sampler", 525, 0, 0.0, 0.5619047619047624, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.45482662009242075, 2.7942953614832025, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 541, 0, 0.0, 1087.6099815157108, 544, 5401, 955.0, 1593.0, 1814.2999999999997, 2261.7400000000002, 0.4567366545939603, 204.13719888148063, 1.620943368823291], "isController": false}, {"data": ["4.2 Vaccination batch", 499, 0, 0.0, 899.1623246492985, 556, 3571, 850.0, 1114.0, 1294.0, 2135.0, 0.45300216061150755, 174.5243147519609, 2.025930565106578], "isController": false}, {"data": ["1.1 Homepage", 547, 0, 0.0, 816.780621572213, 536, 2565, 765.0, 985.0, 1197.2000000000003, 2028.279999999996, 0.4585164185760341, 178.05237515381674, 1.9099958321213801], "isController": false}, {"data": ["1.3 Sign-in", 546, 0, 0.0, 997.2728937728941, 444, 6747, 961.0, 1370.3, 1627.249999999999, 2193.789999999999, 0.4583463100183926, 178.67351503350713, 2.1051692948476335], "isController": false}, {"data": ["2.2 Session register", 537, 0, 0.0, 565.9031657355683, 317, 1788, 512.0, 827.4, 964.0, 1412.4200000000005, 0.4571446083751957, 186.5622619703571, 1.631296984750354], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 125, 0, 0.0, 3927.5519999999997, 1998, 6194, 3808.0, 4836.2, 5422.099999999999, 6167.219999999999, 0.11498725481267656, 131.0108482497675, 1.6493151977159852], "isController": true}, {"data": ["2.1 Open session", 539, 0, 0.0, 682.4656771799627, 347, 4615, 616.0, 975.0, 1205.0, 1658.8000000000034, 0.45755362460568894, 177.10715955362843, 1.6287465253725795], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, 100.0, 0.12408658486143664], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7253, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 395, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
