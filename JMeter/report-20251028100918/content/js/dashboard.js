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

    var data = {"OkPercent": 99.8460005435275, "KoPercent": 0.15399945647250657};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4393894377181906, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.12418300653594772, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.3963337547408344, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.818069306930693, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8047735618115055, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5687575392038601, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.33473684210526317, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0024183796856106408, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48346055979643765, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.49280575539568344, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.49939686369119424, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7451100244498777, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.12803398058252427, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11039, 17, 0.15399945647250657, 1040.0719268049672, 0, 10634, 810.0, 2207.0, 2738.0, 4100.6, 6.126368915184837, 2130.1904713404324, 21.929401531793406], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 765, 0, 0.0, 1995.4104575163408, 1087, 7422, 1810.0, 2883.6, 3401.1, 4471.160000000009, 0.4601500991578351, 185.28979867436922, 2.386952276645247], "isController": false}, {"data": ["4.1 Vaccination questions", 791, 0, 0.0, 1409.3590391908967, 859, 3326, 1322.0, 1694.8000000000002, 1879.0, 2383.6400000000044, 0.4610677536440965, 181.68016604085898, 2.290923570150788], "isController": false}, {"data": ["Get Next Patient from STS", 826, 0, 0.0, 0.6355932203389828, 0, 1, 1.0, 1.0, 1.0, 1.0, 0.46369144421921044, 0.1954383696319716, 0.2960304630121868], "isController": false}, {"data": ["2.0 Register attendance", 810, 17, 2.0987654320987654, 4918.118518518521, 2097, 11887, 4664.0, 7101.199999999999, 7982.049999999998, 10584.22, 0.4604001843874319, 862.6858642604908, 8.088361550488564], "isController": true}, {"data": ["1.0 Login", 828, 0, 0.0, 4927.332125603866, 2824, 8113, 4819.0, 5889.4, 6207.949999999999, 7068.970000000004, 0.46265564339307624, 767.8325110657745, 7.6656381326732115], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 196, 0, 0.0, 4225.826530612245, 2140, 7333, 4135.5, 5264.900000000001, 5691.449999999995, 6918.81, 0.11657722140571906, 137.79732163462083, 1.688356513588681], "isController": true}, {"data": ["2.5 Select patient", 808, 0, 0.0, 517.52599009901, 310, 2447, 428.0, 786.0, 1006.4499999999991, 1563.9099999999999, 0.4607869191261929, 186.84481915628234, 1.6378404478600783], "isController": false}, {"data": ["2.3 Search by first/last name", 817, 0, 0.0, 524.9106487148101, 317, 2386, 462.0, 787.4000000000003, 961.0999999999999, 1366.6599999999992, 0.46320707113658655, 188.44530379626403, 1.71292347994234], "isController": false}, {"data": ["4.0 Vaccination for flu", 197, 0, 0.0, 4233.076142131979, 2071, 7298, 4106.0, 5141.200000000002, 5607.599999999999, 6650.220000000007, 0.11537139339946789, 136.44822247528447, 1.6703344606445922], "isController": true}, {"data": ["4.0 Vaccination for hpv", 196, 0, 0.0, 4354.913265306124, 2133, 9554, 4109.5, 5461.900000000001, 6392.299999999998, 8565.570000000002, 0.11587417011037605, 136.79792506347954, 1.6802689954566683], "isController": true}, {"data": ["1.2 Sign-in page", 829, 0, 0.0, 833.2291917973454, 221, 3295, 670.0, 1383.0, 1518.5, 1942.6000000000004, 0.4634355500348275, 185.60018480645556, 1.964942143579489], "isController": false}, {"data": ["Debug Sampler", 810, 0, 0.0, 0.5246913580246915, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.45960210940345914, 2.873943899250111, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 475, 17, 3.5789473684210527, 1376.6210526315786, 488, 4094, 1240.0, 2064.8, 2362.4, 3296.5200000000004, 0.30295705217047997, 123.38874870426066, 1.3191443912843404], "isController": false}, {"data": ["1.4 Open Sessions list", 827, 0, 0.0, 2311.218863361552, 1467, 5304, 2214.0, 3019.8, 3275.3999999999996, 4068.6400000000017, 0.4626664018596168, 211.99564407991906, 1.6430593789598678], "isController": false}, {"data": ["4.2 Vaccination batch", 786, 0, 0.0, 912.3625954198474, 504, 3528, 855.0, 1211.3000000000002, 1349.65, 1936.1499999999996, 0.46110172807552213, 182.9062348481004, 2.0633761519476854], "isController": false}, {"data": ["1.1 Homepage", 834, 0, 0.0, 805.814148681055, 476, 2813, 748.0, 1097.5, 1297.5, 1819.5499999999997, 0.46394445127442874, 185.7110425254947, 1.9539990897384834], "isController": false}, {"data": ["1.3 Sign-in", 829, 0, 0.0, 981.788902291918, 432, 3680, 892.0, 1455.0, 1648.5, 2129.1000000000004, 0.46267486347184744, 185.62367917122458, 2.114787814531004], "isController": false}, {"data": ["2.2 Session register", 818, 0, 0.0, 564.4339853300729, 313, 3761, 497.0, 814.1, 1032.5499999999995, 1558.739999999997, 0.46213670998209644, 191.62689198691385, 1.6501821252243596], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 197, 0, 0.0, 4234.954314720816, 2092, 7495, 4133.0, 5060.8, 5541.0, 7001.080000000005, 0.11680525184872476, 138.43963620296515, 1.6946066425649604], "isController": true}, {"data": ["2.1 Open session", 824, 0, 0.0, 2513.7172330097096, 823, 10634, 2202.5, 4175.5, 5338.25, 8019.0, 0.4627684787272519, 186.11478178574296, 1.6483856473956917], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, 100.0, 0.15399945647250657], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11039, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 475, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
