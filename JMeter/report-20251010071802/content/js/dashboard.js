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

    var data = {"OkPercent": 99.9780268072951, "KoPercent": 0.021973192704900023};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7051593733117234, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4878048780487805, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5217225609756098, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.19054878048780488, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.008683068017366137, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9942835365853658, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.9954268292682927, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.934876989869754, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4931077694235589, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.7217800289435601, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.9336890243902439, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9479015918958031, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8241678726483358, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.973704268292683, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8654725609756098, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18204, 4, 0.021973192704900023, 407.26494177103825, 0, 5141, 380.0, 775.0, 928.0, 1219.0, 5.889683929354852, 128.2659150997524, 6.365793961601875], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1312, 0, 0.0, 1008.9336890243906, 817, 4417, 942.0, 1217.0, 1366.35, 1775.0599999999959, 0.4451976005478102, 9.024048740060252, 1.0367616399279473], "isController": false}, {"data": ["4.1 Vaccination questions", 1312, 0, 0.0, 624.4298780487812, 379, 5141, 602.0, 703.0, 745.3999999999996, 1070.2699999999977, 0.44576437207870595, 5.155545092085847, 0.9415254723802764], "isController": false}, {"data": ["2.0 Register attendance", 1312, 4, 0.3048780487804878, 1579.0449695121922, 836, 4346, 1620.0, 2056.7, 2222.35, 2738.959999999999, 0.44585753492437413, 49.908952721918624, 1.6560146329075145], "isController": true}, {"data": ["1.0 Login", 1382, 0, 0.0, 1892.9985528219959, 1433, 6278, 1883.5, 2148.7, 2302.0, 2753.860000000004, 0.44894749101049247, 59.05911623238766, 2.226144352678303], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 328, 0, 0.0, 2075.9756097560976, 1785, 5149, 1998.0, 2288.7000000000003, 2485.65, 4072.089999999984, 0.11247598740543273, 5.287029107533902, 0.6826800031582435], "isController": true}, {"data": ["2.5 Select patient", 1312, 0, 0.0, 258.0792682926825, 200, 3219, 242.0, 299.70000000000005, 340.6999999999998, 498.829999999999, 0.4458582925054687, 10.282778445746318, 0.3103383959729685], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 1312, 0, 0.0, 241.9161585365853, 194, 1510, 227.0, 283.70000000000005, 321.3499999999999, 493.08999999999924, 0.4461733662386191, 10.63772786733977, 0.3531094385561122], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 327, 0, 0.0, 2063.8195718654447, 1791, 4974, 1987.0, 2339.2, 2467.399999999999, 3172.1999999999844, 0.11150351406563977, 5.073245722267422, 0.673279122173241], "isController": true}, {"data": ["4.0 Vaccination for hpv", 328, 0, 0.0, 2063.4268292682927, 1784, 2930, 2012.0, 2324.2, 2452.75, 2813.9799999999973, 0.11197921556511096, 4.858252033890783, 0.6787719744274295], "isController": true}, {"data": ["1.2 Sign-in page", 1382, 0, 0.0, 392.7431259044864, 98, 4535, 355.0, 606.0, 655.8499999999999, 872.9300000000021, 0.44919993980330764, 8.428962456111995, 0.5908093599884092], "isController": false}, {"data": ["Debug Sampler", 2694, 0, 0.0, 0.4394951744617672, 0, 9, 0.0, 1.0, 1.0, 1.0, 0.8754074836616599, 4.805264699977156, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 798, 4, 0.5012531328320802, 702.1729323308274, 301, 2579, 646.0, 861.0, 1017.05, 1454.6199999999994, 0.3001199351470155, 7.478782433778988, 0.44565653727410615], "isController": false}, {"data": ["1.4 Open Sessions list", 1382, 0, 0.0, 602.7315484804626, 417, 2558, 518.0, 805.7, 863.2499999999995, 1159.7800000000025, 0.44899956269651853, 33.79247880653837, 0.29040953422305854], "isController": false}, {"data": ["4.2 Vaccination batch", 1312, 0, 0.0, 443.92378048780563, 367, 1737, 416.0, 541.1000000000001, 615.3499999999999, 758.2199999999993, 0.44587480841316823, 6.328844048000359, 0.7215735958936697], "isController": false}, {"data": ["1.1 Homepage", 1382, 0, 0.0, 435.29739507959516, 288, 1559, 421.0, 502.0, 561.8499999999999, 757.8500000000004, 0.4491470917725807, 8.233952764257413, 0.5860311907996021], "isController": false}, {"data": ["1.3 Sign-in", 1382, 0, 0.0, 462.22648335745237, 303, 1403, 375.0, 661.7, 702.0, 879.0200000000004, 0.44896353422015, 8.616345317748094, 0.7595475536076104], "isController": false}, {"data": ["2.2 Session register", 1312, 0, 0.0, 260.0868902439021, 187, 979, 225.0, 414.2000000000003, 503.3499999999999, 592.0899999999992, 0.4461190532619226, 12.585096035244426, 0.29719730571464226], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 329, 0, 0.0, 2105.799392097266, 1814, 6560, 2025.0, 2374.0, 2523.0, 3202.9999999999995, 0.11331074006722874, 5.463894968973006, 0.6875251984014231], "isController": true}, {"data": ["2.1 Open session", 1312, 0, 0.0, 391.44817073170736, 210, 2834, 328.5, 610.0, 663.7499999999995, 836.4399999999987, 0.44598484467354044, 7.148716253806338, 0.29318810944746826], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 100.0, 0.021973192704900023], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18204, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 798, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
