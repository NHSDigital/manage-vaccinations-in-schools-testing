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

    var data = {"OkPercent": 99.966940587513, "KoPercent": 0.03305941248701237};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8019001376357241, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.3491196114146934, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9872185027388922, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6111111111111112, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9909145972138098, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.45555555555555555, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.45566502463054187, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3333333333333333, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9760355029585799, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.6404697380307136, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9834613112817484, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9768957345971564, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4630541871921182, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7886940749697703, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.48148148148148145, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.49279448621553884, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9821098087600246, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.37037037037037035, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.46208530805687204, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.45409429280397023, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5714285714285714, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7513562386980108, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9845679012345679, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9821536600120992, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21174, 7, 0.03305941248701237, 275.3469821479156, 0, 10767, 115.0, 675.0, 847.0, 1414.9700000000048, 5.525752921023541, 2173.308198482202, 41.576537123232846], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 115.77777777777779, 79, 402, 86.0, 288.4, 376.39999999999986, 402.0, 0.007964322196359478, 3.3834723864966096, 0.0585407063697469], "isController": false}, {"data": ["2.0 Register attendance", 1647, 6, 0.36429872495446264, 1347.9581056466309, 443, 4074, 1263.0, 1981.8000000000002, 2326.7999999999997, 3081.839999999999, 0.4617045897977583, 920.4052083044243, 15.981114927491776], "isController": true}, {"data": ["2.5 Select patient", 1643, 0, 0.0, 124.13998782714528, 64, 1602, 88.0, 187.0, 300.79999999999995, 772.4799999999996, 0.46293387371400607, 195.22943928983605, 3.300181368010452], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 930.6666666666669, 260, 4836, 646.0, 1619.7999999999993, 3830.7999999999947, 4836.0, 0.00795888968183012, 3.4167805874869157, 0.05807502314710416], "isController": false}, {"data": ["2.3 Search by first/last name", 1651, 0, 0.0, 123.90248334342813, 74, 1660, 95.0, 183.79999999999995, 264.39999999999986, 664.5600000000009, 0.46244464879275615, 196.76126331769163, 3.4198119648519656], "isController": false}, {"data": ["4.0 Vaccination for flu", 405, 0, 0.0, 1046.5012345679017, 206, 3865, 951.0, 1553.0000000000005, 1761.8999999999996, 2357.9599999999996, 0.1156903543381312, 142.67882431471676, 3.2436747258388547], "isController": true}, {"data": ["4.0 Vaccination for hpv", 406, 0, 0.0, 1029.561576354681, 174, 3214, 913.0, 1511.0, 1730.6999999999996, 2377.3100000000004, 0.11630015408338149, 143.39078178186372, 3.2664634787259517], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2001.9259259259259, 665, 10767, 1087.0, 6929.799999999999, 9370.999999999993, 10767.0, 0.00796498474705421, 4.108227528252096, 0.05805986440129717], "isController": false}, {"data": ["1.2 Sign-in page", 1690, 0, 0.0, 154.24201183431938, 13, 5025, 101.0, 260.9000000000001, 476.34999999999945, 956.3499999999988, 0.4701191960794841, 197.08570911013112, 3.9429889284842994], "isController": false}, {"data": ["2.4 Patient attending session", 1107, 5, 0.45167118337850043, 637.5736224028904, 92, 3133, 545.0, 908.8000000000002, 1116.1999999999998, 1795.4400000000005, 0.3108934887894392, 132.68263878966735, 2.695907426952668], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.966145833333334, 13.10763888888889], "isController": false}, {"data": ["1.1 Homepage", 1693, 0, 0.0, 143.44004725339616, 28, 7649, 102.0, 194.60000000000014, 322.39999999999964, 802.5399999999995, 0.47050191966450683, 197.03523583978202, 3.937803660285386], "isController": false}, {"data": ["1.3 Sign-in", 1688, 0, 0.0, 172.01244075829382, 70, 5259, 105.0, 321.10000000000014, 476.64999999999986, 939.7499999999975, 0.4702557656477049, 197.3483869916439, 4.103581389070899], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 8327.259259259261, 4873, 20696, 6853.0, 16550.399999999998, 19972.799999999996, 20696.0, 0.007943975553739229, 29.954284087176156, 0.4654727767864971], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 406, 0, 0.0, 1043.7463054187206, 193, 4357, 939.5, 1430.0, 1705.6499999999996, 2776.1200000000026, 0.1172499514827787, 145.13797472873674, 3.290853585061663], "isController": true}, {"data": ["2.1 Open session", 1654, 1, 0.060459492140266025, 522.8591293833132, 110, 3190, 437.0, 941.5, 1176.5, 1663.8500000000033, 0.4614615441273299, 193.61217271523526, 3.292204992695153], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1269.4074074074072, 421, 6789, 859.0, 2960.7999999999984, 6110.199999999996, 6789.0, 0.00799488327470419, 4.130877072007249, 0.05826739636632555], "isController": false}, {"data": ["4.3 Vaccination confirm", 1596, 0, 0.0, 748.7268170426078, 483, 4148, 646.0, 1080.7999999999997, 1309.049999999999, 1846.2999999999997, 0.4617191168204332, 193.5177171760488, 4.705503809038065], "isController": false}, {"data": ["4.1 Vaccination questions", 1621, 0, 0.0, 158.48365206662533, 85, 1446, 114.0, 250.0, 401.59999999999945, 778.3399999999999, 0.4623048964961795, 189.49962915655522, 4.288765647441466], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1568.7777777777776, 677, 8002, 1198.0, 2564.3999999999996, 5968.399999999989, 8002.0, 0.00798010058473448, 4.12635853823473, 0.058177265410165345], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1688, 1, 0.05924170616113744, 987.5734597156394, 255, 17933, 870.0, 1400.3000000000004, 1639.0, 2431.22, 0.47039572318883716, 812.6605917400719, 15.281536218502577], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 403, 0, 0.0, 1034.258064516127, 187, 4065, 925.0, 1483.8000000000006, 1768.7999999999988, 2447.199999999997, 0.11541999704433159, 142.88368542414057, 3.2483885726971278], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 989.5714285714286, 294, 5015, 644.5, 2382.500000000004, 4986.65, 5015.0, 0.007938402532577219, 4.063035388104956, 0.05659074308196571], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2226.703703703704, 1786, 3977, 2057.0, 3047.1999999999994, 3880.5999999999995, 3977.0, 0.007963283952124737, 4.118883621877028, 0.05872749100370116], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 102.5185185185185, 76, 248, 91.0, 143.0, 210.79999999999978, 248.0, 0.007961926656500957, 3.3828955818752933, 0.058663054010024356], "isController": false}, {"data": ["Debug Sampler", 1651, 0, 0.0, 0.5687462144155057, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.46245967483286604, 2.6634782520704943, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1659, 1, 0.06027727546714889, 526.9722724532844, 300, 2231, 497.0, 780.0, 879.0, 1302.4000000000005, 0.4622813010975489, 221.0455873709395, 3.2946998862792176], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1620, 0, 0.0, 142.36790123456836, 78, 2365, 103.0, 217.0, 351.89999999999964, 788.6399999999994, 0.4631625654860405, 191.13954008368233, 4.060306109089222], "isController": false}, {"data": ["2.2 Session register", 1653, 0, 0.0, 149.32728372655785, 73, 1929, 94.0, 304.60000000000014, 410.5999999999999, 748.0800000000017, 0.46199135883313225, 201.05677946815933, 3.3004420395087855], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 111.48148148148148, 75, 399, 87.0, 187.99999999999994, 336.99999999999966, 399.0, 0.007967102358970485, 3.385094943423983, 0.058452216363041376], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 71.42857142857143, 0.023613866062151694], "isController": false}, {"data": ["Assertion failed", 2, 28.571428571428573, 0.009445546424860679], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21174, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "Assertion failed", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1107, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 1654, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1659, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
