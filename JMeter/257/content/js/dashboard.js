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

    var data = {"OkPercent": 99.88818166179253, "KoPercent": 0.11181833820746602};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7359432842075854, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.35224586288416077, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9804372842347526, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.16263736263736264, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.319672131147541, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.3157894736842105, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9651162790697675, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9622124863088719, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3075221238938053, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.27149321266968324, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9153005464480874, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.43349455864570735, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7866520787746171, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9844110854503464, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9311475409836065, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8770491803278688, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9452354874041621, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.26904761904761904, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8127053669222344, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11626, 13, 0.11181833820746602, 398.4783244452091, 0, 6336, 186.0, 959.0, 1377.949999999999, 2529.3799999999974, 5.745107195714643, 2250.952188913762, 43.22893599420103], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 846, 0, 0.0, 1364.2695035461, 563, 6336, 1040.5, 2526.8, 3176.7499999999995, 4757.0599999999995, 0.5096170643406603, 213.43851287615132, 5.214386196817002], "isController": false}, {"data": ["4.1 Vaccination questions", 869, 0, 0.0, 177.95972382048294, 95, 1443, 130.0, 273.0, 430.5, 957.3, 0.51017622508341, 209.05664713681938, 4.749455506865069], "isController": false}, {"data": ["2.0 Register attendance", 910, 13, 1.4285714285714286, 2030.5824175824168, 512, 6432, 1818.5, 3185.7999999999997, 3680.9499999999994, 5114.779999999999, 0.5162438100381623, 1079.0104896549492, 18.979958739851696], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 915, 0, 0.0, 1451.6415300546414, 330, 4654, 1237.0, 2529.6, 2962.9999999999986, 3813.000000000001, 0.510940264103068, 883.218051200193, 16.52280072237321], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 209, 0, 0.0, 1606.9377990430626, 233, 5369, 1318.0, 2809.0, 3493.0, 4989.000000000002, 0.12286644476242096, 151.56783005311033, 3.459403795904432], "isController": true}, {"data": ["2.5 Select patient", 903, 0, 0.0, 186.34551495016612, 74, 1703, 115.0, 366.20000000000005, 578.3999999999996, 1161.0400000000009, 0.5162271399415742, 217.58067187955558, 3.695106315528833], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["2.3 Search by first/last name", 913, 0, 0.0, 205.96166484118294, 74, 1628, 128.0, 446.6, 600.0, 1060.0400000000002, 0.5163962891864468, 219.89906890387252, 3.8338946892346364], "isController": false}, {"data": ["4.0 Vaccination for flu", 226, 0, 0.0, 1623.7566371681414, 238, 5142, 1347.0, 2823.7000000000003, 3503.25, 4940.609999999997, 0.13261883469120936, 162.73503775034004, 3.713823637561527], "isController": true}, {"data": ["4.0 Vaccination for hpv", 221, 0, 0.0, 1713.8506787330314, 216, 5931, 1448.0, 2932.2000000000007, 3567.3999999999996, 5541.820000000001, 0.12966173541378814, 159.30262734150173, 3.6450512514044244], "isController": true}, {"data": ["1.2 Sign-in page", 915, 0, 0.0, 286.95191256830554, 15, 2473, 155.0, 648.4, 1000.5999999999995, 1673.760000000002, 0.5109548154001223, 212.99773486296357, 4.211799845317504], "isController": false}, {"data": ["Debug Sampler", 913, 0, 0.0, 0.34282584884994544, 0, 15, 0.0, 1.0, 1.0, 1.0, 0.516436014539399, 2.9411501443319876, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 827, 13, 1.5719467956469166, 982.6674727932285, 248, 4323, 747.0, 1721.2000000000005, 2241.399999999999, 3684.4800000000023, 0.4698252329668469, 200.49393087224018, 4.08291935133156], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 11.195591517857142, 21.065848214285715], "isController": false}, {"data": ["1.4 Open Sessions list", 914, 0, 0.0, 541.6017505470462, 266, 1809, 444.0, 922.0, 1179.25, 1609.5000000000002, 0.5122795768593115, 244.96168797521779, 3.665470892263233], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 866, 0, 0.0, 168.45727482678979, 91, 902, 125.0, 282.2000000000003, 388.7999999999997, 720.6600000000001, 0.5094474260257041, 210.11193612137407, 4.482896523344869], "isController": false}, {"data": ["1.1 Homepage", 915, 0, 0.0, 269.7715846994536, 33, 2789, 166.0, 579.4, 853.7999999999997, 1543.3200000000047, 0.511003325710169, 212.7980280079736, 4.1985105684144095], "isController": false}, {"data": ["1.3 Sign-in", 915, 0, 0.0, 353.90601092896253, 80, 2435, 198.0, 788.1999999999999, 1079.3999999999987, 1887.0800000000013, 0.5111514818365254, 213.4885946576081, 4.463080299209363], "isController": false}, {"data": ["2.2 Session register", 913, 0, 0.0, 231.3044906900325, 70, 2159, 124.0, 505.20000000000005, 766.1999999999989, 1258.44, 0.5162470816207558, 223.4428438534933, 3.7039399542233595], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 210, 0, 0.0, 1774.8523809523801, 230, 6584, 1454.5, 2943.8, 3727.199999999996, 5815.359999999997, 0.12368008320724837, 152.94433286907903, 3.4821660405853248], "isController": true}, {"data": ["2.1 Open session", 913, 0, 0.0, 513.8893756845563, 145, 2565, 386.0, 995.0, 1400.0, 1977.3800000000006, 0.5164062199517191, 216.73029430647296, 3.70054300425116], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, 100.0, 0.11181833820746602], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11626, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 827, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
