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

    var data = {"OkPercent": 99.70583760206928, "KoPercent": 0.2941623979307197};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.39602214476112363, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.40836653386454186, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4899088541666667, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.49774774774774777, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.49808184143222506, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5165184243964421, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4609756097560976, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48990228013029313, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5139593908629442, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4898348157560356, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.49361430395913153, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.49394132653061223, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19717, 58, 0.2941623979307197, 910.7854136024735, 0, 8132, 722.0, 1572.0, 2398.199999999997, 3054.8199999999997, 5.4742833344901785, 130.27869075145762, 6.365582377490109], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1506, 24, 1.593625498007968, 1334.380478087648, 109, 8132, 1200.0, 1722.3, 2110.2999999999997, 3030.760000000002, 0.43530767234108236, 8.690597025935926, 1.0034968347878757], "isController": false}, {"data": ["4.1 Vaccination questions", 1536, 0, 0.0, 971.076822916666, 669, 5685, 915.0, 1090.0, 1253.4499999999996, 1962.499999999994, 0.4385590480070832, 5.040743656401121, 0.926465970969304], "isController": false}, {"data": ["2.0 Register attendance", 1557, 10, 0.6422607578676943, 3484.4733461785495, 1923, 10916, 3486.0, 4237.6, 4620.299999999999, 6164.800000000003, 0.4366002830470942, 54.02756340071592, 1.6530477432013597], "isController": true}, {"data": ["1.0 Login", 1574, 0, 0.0, 4998.637865311311, 2300, 10339, 4815.5, 5796.0, 6355.0, 7649.0, 0.4384469507045235, 57.55683962053099, 2.1756225950181953], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 382, 7, 1.8324607329842932, 2995.476439790574, 1306, 7470, 2886.0, 3484.2999999999997, 3995.7999999999997, 5702.450000000006, 0.10970407183032055, 5.039277270579924, 0.6575418094207655], "isController": true}, {"data": ["2.5 Select patient", 1554, 0, 0.0, 642.6409266409263, 542, 3089, 590.0, 774.5, 964.5, 1232.2500000000002, 0.43899011933242993, 10.104945104342075, 0.30555367081475604], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 1564, 0, 0.0, 657.960358056265, 559, 2732, 609.0, 762.5, 887.5, 1314.5999999999985, 0.43815439507518944, 12.215025370284588, 0.34682964154754226], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 386, 0, 0.0, 3031.2564766839378, 1564, 7160, 2909.5, 3524.8, 3927.0999999999985, 5397.829999999996, 0.11065038634471035, 4.974905633190386, 0.6628978916944845], "isController": true}, {"data": ["4.0 Vaccination for hpv", 384, 8, 2.0833333333333335, 3014.4010416666683, 1280, 9571, 2869.0, 3613.0, 4101.0, 5901.349999999989, 0.11019255287735999, 4.683184057756106, 0.6605421649364427], "isController": true}, {"data": ["1.2 Sign-in page", 1574, 0, 0.0, 788.4237611181712, 107, 3486, 717.0, 1059.0, 1188.5, 1573.5, 0.4386452605550061, 8.178591905779193, 0.578766721608797], "isController": false}, {"data": ["Debug Sampler", 1569, 0, 0.0, 0.5825366475462085, 0, 9, 1.0, 1.0, 1.0, 1.0, 0.43833170227750895, 2.8077296244204115, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1025, 10, 0.975609756097561, 1110.0526829268294, 165, 7444, 994.0, 1386.4, 1641.3999999999992, 2891.44, 0.28841903318000695, 8.295771150893241, 0.4273663313197464], "isController": false}, {"data": ["1.4 Open Sessions list", 1570, 0, 0.0, 2577.101273885346, 2033, 5967, 2463.5, 3080.5000000000005, 3572.8999999999996, 4859.089999999999, 0.4378294701622005, 33.09118556028647, 0.2833222475794584], "isController": false}, {"data": ["4.2 Vaccination batch", 1535, 24, 1.5635179153094463, 745.8755700325722, 261, 1914, 704.0, 883.2000000000003, 1023.3999999999996, 1410.9199999999996, 0.4390430862869826, 6.157572581544746, 0.7103987739328537], "isController": false}, {"data": ["1.1 Homepage", 1576, 0, 0.0, 747.5469543147209, 315, 2174, 711.0, 875.8999999999999, 1045.5999999999995, 1589.5300000000002, 0.4376906043990683, 7.9748266109222135, 0.5730811195902094], "isController": false}, {"data": ["1.3 Sign-in", 1574, 0, 0.0, 892.0648030495547, 630, 5336, 798.0, 1116.5, 1293.5, 1732.0, 0.4386516172561199, 8.34424767859865, 0.7404107575964901], "isController": false}, {"data": ["2.2 Session register", 1566, 0, 0.0, 686.8684546615585, 549, 2642, 610.0, 866.0, 1132.5999999999995, 1684.5999999999985, 0.4381403711099304, 13.686529460760696, 0.2920782801003974], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 383, 9, 2.349869451697128, 3063.344647519582, 1246, 9775, 2916.0, 3634.2000000000003, 4143.599999999999, 6148.159999999934, 0.11076717693798455, 5.210440080271498, 0.6635044050558998], "isController": true}, {"data": ["2.1 Open session", 1568, 0, 0.0, 765.6543367346939, 577, 4810, 691.0, 1002.0, 1114.0, 1556.9599999999991, 0.4382662322017232, 7.125817156980508, 0.2883115271076609], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 24, 41.37931034482759, 0.12172237155753918], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 24, 41.37931034482759, 0.12172237155753918], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, 17.24137931034483, 0.050717654815641326], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19717, 58, "Test failed: text expected to contain /Check and confirm/", 24, "Test failed: text expected to contain /Vaccination outcome recorded for/", 24, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["4.3 Vaccination confirm", 1506, 24, "Test failed: text expected to contain /Vaccination outcome recorded for/", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1025, 10, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1535, 24, "Test failed: text expected to contain /Check and confirm/", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
