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

    var data = {"OkPercent": 99.95508847570287, "KoPercent": 0.044911524297134645};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6597375792422232, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4542566709021601, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5076238881829733, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.12452350698856417, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9815756035578145, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.9866581956797967, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8891481913652275, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4882246376811594, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.4294049008168028, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.8398983481575604, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8570595099183197, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7590431738623103, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9669631512071156, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8811944091486659, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11133, 5, 0.044911524297134645, 511.3158178388562, 0, 5476, 431.0, 1050.6000000000004, 1267.2999999999993, 1721.3199999999997, 4.344068315771196, 96.03668019208934, 4.687069792058897], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 787, 0, 0.0, 1171.733163913597, 855, 5476, 1085.0, 1442.2000000000005, 1732.3999999999987, 2496.0000000000014, 0.3239868412764999, 6.6348029594211635, 0.7542677939840955], "isController": false}, {"data": ["4.1 Vaccination questions", 787, 0, 0.0, 712.0012706480314, 424, 2174, 669.0, 841.0, 973.1999999999998, 1433.64, 0.3253171118454285, 3.590073308862556, 0.6859368431394879], "isController": false}, {"data": ["2.0 Register attendance", 787, 5, 0.6353240152477764, 1848.9466327827204, 951, 6682, 1849.0, 2432.4, 2682.5999999999995, 3237.88, 0.32533634279785123, 38.02880235558808, 1.251701269178619], "isController": true}, {"data": ["1.0 Login", 857, 0, 0.0, 2718.0070011668636, 2034, 7068, 2632.0, 3186.4000000000005, 3457.3999999999996, 4526.859999999999, 0.33593180701913244, 44.46449459326674, 1.6541367036417047], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 17, 0, 0.0, 2277.9411764705883, 2018, 2761, 2201.0, 2700.2, 2761.0, 2761.0, 0.041781668661536535, 1.971908509819921, 0.2518012776281284], "isController": true}, {"data": ["2.5 Select patient", 787, 0, 0.0, 299.16264294790346, 226, 996, 277.0, 405.20000000000005, 474.1999999999998, 695.8000000000001, 0.3247405685972157, 7.605306871326811, 0.2258159216391105], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 787, 0, 0.0, 286.4523506988565, 218, 3363, 255.0, 385.0, 446.39999999999964, 651.36, 0.3254040054049316, 7.739340547670032, 0.25750140606988037], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 257, 0, 0.0, 2456.972762645914, 1958, 6578, 2300.0, 2804.2000000000003, 3264.2, 6339.04, 0.10663679176780565, 4.851811538531358, 0.6437427225316902], "isController": true}, {"data": ["4.0 Vaccination for hpv", 257, 0, 0.0, 2360.482490272376, 1960, 5208, 2266.0, 2719.4, 2953.7999999999997, 4638.999999999999, 0.1077898961022838, 4.676836267855585, 0.6531874870767463], "isController": true}, {"data": ["1.2 Sign-in page", 857, 0, 0.0, 444.9113185530916, 108, 4200, 392.0, 689.2, 743.3999999999996, 1133.339999999997, 0.33634948949055027, 6.243092625871045, 0.4343397632700078], "isController": false}, {"data": ["Debug Sampler", 1644, 0, 0.0, 0.40693430656934304, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.6455724684547139, 3.63062150744411, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 552, 5, 0.9057971014492754, 799.6865942028986, 282, 3939, 743.0, 1026.0, 1175.6000000000004, 1598.2700000000038, 0.23227063905563472, 5.779578401570898, 0.3442766425100293], "isController": false}, {"data": ["1.4 Open Sessions list", 857, 0, 0.0, 1225.7479579930011, 893, 4388, 1169.0, 1585.6000000000001, 1735.6999999999994, 2147.499999999997, 0.33631622672815326, 25.702573507120917, 0.21698667908623234], "isController": false}, {"data": ["4.2 Vaccination batch", 787, 0, 0.0, 540.2490470139783, 412, 4308, 464.0, 670.2, 793.599999999999, 2663.880000000001, 0.3251192861421519, 4.616810615821164, 0.5257445540195815], "isController": false}, {"data": ["1.1 Homepage", 857, 0, 0.0, 496.1633605600934, 317, 2897, 464.0, 612.4000000000001, 703.4999999999995, 1055.5999999999988, 0.33615462642120447, 6.0874846858670315, 0.43001398331661056], "isController": false}, {"data": ["1.3 Sign-in", 857, 0, 0.0, 551.1843640606771, 331, 3732, 473.0, 764.4000000000001, 854.0999999999999, 1041.9399999999996, 0.3364221096453436, 6.481957242104189, 0.5747062808280616], "isController": false}, {"data": ["2.2 Session register", 787, 0, 0.0, 294.30749682337984, 210, 1987, 249.0, 480.4000000000001, 516.7999999999997, 662.12, 0.32552918139544884, 9.908451994734866, 0.21645528684001752], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 256, 0, 0.0, 2464.3124999999964, 2013, 6195, 2339.0, 2973.2000000000003, 3225.2999999999993, 5105.320000000003, 0.10720169244671951, 5.163737253703065, 0.6503159309252595], "isController": true}, {"data": ["2.1 Open session", 787, 0, 0.0, 407.7217280813213, 233, 5247, 334.0, 654.2, 743.9999999999995, 925.0400000000002, 0.3255114086164979, 5.222706565062575, 0.2135825290075335], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.044911524297134645], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11133, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 552, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
