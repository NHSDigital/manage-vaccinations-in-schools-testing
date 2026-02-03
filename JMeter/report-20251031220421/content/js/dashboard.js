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

    var data = {"OkPercent": 99.9717094561143, "KoPercent": 0.028290543885706204};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4480563190665844, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.06797331109257715, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.45439469320066334, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.003703703703703704, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9106995884773662, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8864197530864197, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6249014972419228, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.33361344537815124, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3505520504731861, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5103734439834025, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6229314420803782, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5449526813880127, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7748971193415638, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5728395061728395, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14139, 4, 0.028290543885706204, 921.5427540844498, 302, 6040, 742.0, 1663.0, 1887.0, 2568.6000000000004, 3.9276167374974755, 1603.990527624276, 16.53468144313595], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1199, 0, 0.0, 1912.0350291909906, 1279, 6040, 1765.0, 2500.0, 2930.0, 4147.0, 0.34595516663411013, 139.7406496820365, 1.8182440861034515], "isController": false}, {"data": ["4.1 Vaccination questions", 1206, 0, 0.0, 1354.4170812603643, 452, 2837, 1321.0, 1484.3, 1613.8999999999992, 1932.8600000000001, 0.34293884371031397, 135.3924725994601, 1.7314423339341398], "isController": false}, {"data": ["2.0 Register attendance", 1215, 4, 0.3292181069958848, 2871.8962962962914, 1416, 5934, 2898.0, 4075.800000000003, 4450.000000000001, 5256.559999999995, 0.3412128699316198, 623.6140412944275, 5.722976515532768], "isController": true}, {"data": ["1.0 Login", 1268, 0, 0.0, 3666.3075709779146, 2095, 6152, 3645.0, 4231.0, 4557.249999999999, 5298.949999999997, 0.35392440197103514, 589.9382537182821, 5.939832757897984], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 337, 0, 0.0, 4097.851632047477, 3266, 6604, 3924.0, 4890.599999999999, 5370.599999999999, 6288.180000000001, 0.10979015420141183, 131.3731477950993, 1.6300618845276351], "isController": true}, {"data": ["2.5 Select patient", 1215, 0, 0.0, 431.4304526748971, 308, 2615, 369.0, 577.0, 692.0, 1292.3999999999992, 0.34133710311836024, 138.79701602542582, 1.229995751634836], "isController": false}, {"data": ["2.3 Search by first/last name", 1215, 0, 0.0, 442.3185185185181, 302, 1928, 408.0, 648.8000000000002, 702.6000000000001, 987.6399999999983, 0.34140414607938785, 139.08262466800906, 1.2860634581970996], "isController": false}, {"data": ["4.0 Vaccination for flu", 141, 0, 0.0, 4127.021276595746, 3380, 7571, 3976.0, 4717.8, 5272.900000000001, 7397.540000000005, 0.09329709965122766, 111.48349997783367, 1.381542629702819], "isController": true}, {"data": ["4.0 Vaccination for hpv", 388, 0, 0.0, 3971.9097938144328, 1958, 8211, 3832.0, 4662.700000000001, 5137.849999999999, 5856.200000000001, 0.11127454958901549, 132.05201197712432, 1.6422720040402985], "isController": true}, {"data": ["1.2 Sign-in page", 1269, 0, 0.0, 795.2852639873905, 353, 3619, 605.0, 1443.0, 1486.5, 2024.9999999999995, 0.3529250786502855, 141.99116125309192, 1.525194759750911], "isController": false}, {"data": ["2.4 Patient attending session", 595, 4, 0.6722689075630253, 1476.865546218487, 401, 3685, 1340.0, 2026.6, 2419.399999999997, 3071.319999999999, 0.20345719944413443, 83.06668712565586, 0.9020462339174778], "isController": false}, {"data": ["1.4 Open Sessions list", 1268, 0, 0.0, 1261.5276025236603, 633, 3463, 1088.5, 1877.2000000000003, 1989.6499999999999, 2523.4099999999994, 0.3540296418856155, 162.79244069061187, 1.2750855120837743], "isController": false}, {"data": ["4.2 Vaccination batch", 1205, 0, 0.0, 799.7029045643161, 449, 3326, 803.0, 972.2000000000003, 1124.4, 1530.920000000001, 0.34476148513520083, 136.991965206628, 1.5635206607439696], "isController": false}, {"data": ["1.1 Homepage", 1269, 0, 0.0, 659.7990543735214, 441, 2233, 602.0, 910.0, 1098.0, 1233.9999999999995, 0.3531344649219765, 141.92339098978735, 1.5185089619001584], "isController": false}, {"data": ["1.3 Sign-in", 1268, 0, 0.0, 950.0173501577298, 431, 2771, 823.0, 1486.1000000000001, 1579.1, 2060.9499999999975, 0.35420715978933054, 142.67304494163963, 1.6150239935718942], "isController": false}, {"data": ["2.2 Session register", 1215, 0, 0.0, 520.0032921810697, 305, 2677, 469.0, 715.0, 832.8000000000002, 1226.239999999997, 0.3413473640678941, 141.46653170964248, 1.2356112823661918], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 339, 0, 0.0, 4083.486725663717, 3265, 7427, 3944.0, 4823.0, 5183.0, 6307.800000000001, 0.11035960955486337, 132.38981884227968, 1.638286203872776], "isController": true}, {"data": ["2.1 Open session", 1215, 0, 0.0, 754.9045267489718, 322, 2743, 686.0, 1154.0000000000005, 1432.4, 1905.919999999999, 0.3414098061326193, 136.30938642686678, 1.2328366384109073], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 100.0, 0.028290543885706204], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14139, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 595, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
